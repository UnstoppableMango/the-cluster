# ncps

`apps/nix-system/` runs [ncps](https://github.com/kalbasit/ncps), a Nix binary cache proxy.
It fronts `cache.nixos.org` and four cachix caches so builds on the cluster substitute over the LAN instead of the internet.

It runs as three replicas in ncps's high-availability shape: NAR bodies in a Ceph S3 bucket, narinfos in a CloudNativePG Postgres cluster, and a Redis for the locks that keep the replicas from fetching the same NAR twice or running the LRU pass at once.
See [Storage](#storage) for what lives where.

Upstreams, in the order `--cache-upstream-url` lists them:

| Upstream                      | Purpose                |
| ----------------------------- | ---------------------- |
| `cache.nixos.org`             | nixpkgs                |
| `nix-community.cachix.org`    | nix-community projects |
| `unstoppablemango.cachix.org` | own builds             |
| `mangopkgs.cachix.org`        | own builds             |
| `unmango.cachix.org`          | own builds             |

Each needs its `--cache-upstream-public-key` alongside it.
Read a cachix cache's key from `https://app.cachix.org/api/v1/cache/<name>` rather than copying it from another repo.

Reached two ways:

- `http://ncps.nix-system.svc.cluster.local:8501` from inside the cluster. This is what the ARC runners use.
- `https://ncps.thecluster.lan` from the LAN, through the nginx Gateway.

Runner pods use the in-cluster Service. The Gateway has an HTTPS-443 listener only, and its certificate comes from the private `thecluster.lan` ClusterIssuer that pods do not trust, so the LAN hostname is not usable from inside.

## Version

`apps/nix-system/deployment.yml` pins `kalbasit/ncps:v0.10.0-rc16`, a release candidate, on purpose.

Cachix serves NARs under opaque object keys (`nar/<uuid>.nar.zst`) rather than the hash-named URLs `cache.nixos.org` uses.
The narinfo `URL:` field is an opaque path by spec, so this is valid upstream behavior, but ncps through v0.9.4 parses that filename as a nix hash and reuses it as its own storage key.
Every cachix-backed narinfo therefore fails with `invalid nar hash` and returns HTTP 500, and nix treats a 500 as a hard error instead of falling through to the next substituter, so runner builds fail outright.
See [kalbasit/ncps#1329](https://github.com/kalbasit/ncps/issues/1329).

The fix landed in `v0.10.0-rc10`.
There is no v0.9 backport and no stable v0.10.0, so the RC is the only release that serves cachix paths.

If the RC misbehaves, the mitigation that does not require downgrading is dropping the cachix upstreams and their `--cache-upstream-public-key` entries, leaving `cache.nixos.org` alone.
ncps then answers those paths from `cache.nixos.org` or 404s, and nix falls through to its own substituters.

v0.10 renamed the serve flags (`--cache-data-path` to `--cache-storage-local`, `--upstream-cache` to `--cache-upstream-url`, `--upstream-public-key` to `--cache-upstream-public-key`) and replaced dbmate with an in-binary migration runner, so the `migrate-database` init container invokes `ncps migrate up`.
The image carries no `/bin/dbmate`, so the image and the init container command have to move together.

## Database backup and restore

ncps migrations are forward-only: `ncps migrate down` exits with an error, and the migration set is sealed by an `atlas.sum` integrity file.
A version bump that carries new migrations is therefore not reversible in place.
Take a backup before any bump that changes the schema.

Every replica runs `ncps migrate up` as an init container, so during a rollout the new pod migrates while the old ones keep serving.
A schema change therefore has to stay readable by the previous image for the length of the rollout, which is upstream's expand-contract policy.

The database is the CNPG cluster `postgres` in `nix-system`.
The two instances have fixed pod names and either can be primary after a failover, so resolve the primary from the Cluster status rather than guessing an ordinal:

```sh
PRIMARY=$(kubectl -n nix-system get cluster postgres -o jsonpath='{.status.currentPrimary}')
```

Every command below runs against `$PRIMARY`; the standby is read-only and refuses the writes.

A logical dump from the primary is the backup:

```sh
kubectl -n nix-system exec "$PRIMARY" -c postgres -- pg_dump -Fc ncps > ncps-$(date +%F).dump
```

Restore is the same shape in reverse, with ncps stopped so nothing writes mid-restore, and the manifest has to go back with it if the dump predates a schema change.
Flux reconciles `replicas: 3` back within its 10m interval, so suspend the Kustomization before scaling down or the pods return mid-restore:

1. `flux suspend kustomization apps-nix-system`.
2. `kubectl -n nix-system scale deployment ncps --replicas=0`.
3. `kubectl -n nix-system exec -i "$PRIMARY" -c postgres -- pg_restore --clean --if-exists -d ncps < ncps-<date>.dump`.
4. Revert `apps/nix-system/deployment.yml` to the image the dump was taken under, if it differs.
5. `flux resume kustomization apps-nix-system`, which reconciles the manifest and brings the replicas back.

Verify a restore by reading `/pubkey` and requesting a narinfo that is known to be cached, as described below.

A dump covers narinfos and the NAR index, not the NAR bodies, which stay in the bucket.
A restored database that references a NAR the bucket no longer holds presents as a cache miss on that path, and ncps refetches it.

## Signing key

ncps signs the narinfos it serves. The key name derives from `--cache-hostname`, so it is always `ncps.thecluster.lan:...`.

`--cache-secret-key-path=/etc/ncps/cache.key` points at `apps/nix-system/signing-key-sealed.yml`, so **git holds the key, every replica signs with it, and a rebuilt database keeps the same identity**.
Without that flag ncps generates a key on first start and stores it in the `config` table of the database under key `secret_key`, in nix `name:base64` format, which makes the identity every consumer trusts depend on the database surviving.
The sealed secret carries exactly the key the original sqlite database held, so adopting the flag changed no consumer.

Read the current public key:

```sh
kubectl -n nix-system port-forward svc/ncps 8501:8501 &
curl -sS http://127.0.0.1:8501/pubkey; echo
```

The current value is `ncps.thecluster.lan:pAJGNVSRmG7gCDSOAaiHDxLFUSdys5Pk0XvcJ5803Dw=`.
Anything consuming ncps as a substituter needs it in `extra-trusted-public-keys`.

The volume survived the pinkdiamond to rosequartz migration but the key material did not, and because the name derives from `--cache-hostname` the superseded key spells `ncps.thecluster.lan:` too.
`UnstoppableMango/nixos` carried that superseded value live for a while, so every machine on the LAN skipped the cache without saying so.
That is the trap this section exists to describe: read `/pubkey`, do not trust a written-down value.
A key that is stale but well-formed is worse than no key: nix treats the signature as untrusted and fails the substitution outright rather than falling back.
So read `/pubkey` before writing the value anywhere, and never copy it forward on faith.

Consumers today:

- `charts/arc-runner-scale-set/values.yaml` and the `defaults:` of `apps/arc-runners/helm-release.yml`, via `NIX_CONFIG` on the runner container
- `apps/unmango-runners/helm-release.yml`, same mechanism
- `UnstoppableMango/nixos` machine configs, via `nix.settings.extra-substituters`

## Storage

Three pieces, none of them a volume ncps mounts:

| Piece    | Where                                                                                      | Holds                                                   |
| -------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Bucket   | `ObjectBucketClaim/ncps-cache`, bucket `ncps-cache` on `CephObjectStore/s3` in `rook-ceph` | NAR bodies and in-flight staging parts                  |
| Postgres | `Cluster/postgres` (CNPG, 2 instances, `ssd-rbd`) in `nix-system`                          | narinfos, the NAR index, `last_accessed_at` for the LRU |
| Redis    | `Deployment/redis` in `nix-system`, snapshots off, reachable from ncps pods only           | per-hash download locks and the global LRU lock         |

The bucket's data pool is erasure-coded on HDD, which is why serve-during-download uses in-flight staging (`--cache-inflight-staging-enabled`) rather than CDC: CDC serves a NAR as many small chunk reads, and upstream advises against it on high-latency storage.

The claim's credentials are Secret `ncps-cache`, written by rook, and the endpoint is the secure listener of the RGW Service, `https://rook-ceph-rgw-s3.rook-ceph.svc:443`.
Its certificate comes from ClusterIssuer `thecluster.lan` (`infrastructure/configs/rook-ceph/storage/certificate.yml`), and ncps trusts it through ConfigMap `thecluster-lan-ca`, which the trust-manager Bundle writes into every namespace and the Deployment mounts at `/etc/ncps/ca` with `SSL_CERT_DIR` pointing there.
Inspect the bucket from the toolbox:

```sh
kubectl -n rook-ceph exec deploy/rook-ceph-tools -- radosgw-admin bucket stats --bucket ncps-cache
```

`--cache-max-size=180G` is the only bound on the cache; the bucket has no quota.

It only works paired with `--cache-lru-schedule`, which registers the cron that enforces it. A max size alone is inert and says nothing about it; a schedule alone fails to start with `ErrCacheMaxSizeRequired`. Removing one silently disables the other, so treat them as a single setting.

A run under the ceiling costs the LRU lock and a sum of `file_size` over `nar_files`. A run that has to evict holds the LRU lock for as long as it takes, ordered by `last_accessed_at`, deleting the NAR and its narinfo together. Only one replica runs it, and the others keep serving.

### The retained RBD volume

The single-replica shape that preceded this one kept everything on PV `pvc-45251306-071e-4cf8-a43c-89112cb0c192`, RBD image `csi-vol-86764a85-c8d5-428e-8658-882d6a1d361d` in pool `unsafe-metadata` (data in `unsafe-data`), 250 GiB, `persistentVolumeReclaimPolicy: Retain`.
The PV is no longer in git and nothing claims it, but the reclaim policy keeps the image in ceph with the old sqlite database and NARs on it.
The signing key it holds in its `config` table is the same key `signing-key-sealed.yml` carries.

Confirm it is still there before counting on it:

```sh
kubectl -n rook-ceph exec deploy/rook-ceph-tools -- \
  rbd -p unsafe-metadata info csi-vol-86764a85-c8d5-428e-8658-882d6a1d361d
```

To fall back to it, restore `apps/nix-system/statefulset.yml`, `pvc.yml`, and `pvs.yml` from git history at the commit before the HA change, clear the PV's `claimRef.uid` so the recreated PVC can bind, and swap them for `deployment.yml` and the bucket, postgres, and redis manifests in `kustomization.yaml`.

## If the bucket or the database is lost

1. The signing key comes from the sealed secret, so it is unchanged and no consumer needs re-keying.
2. The cache itself is regenerable, so there is nothing to restore. It refills from upstream on demand. A lost bucket with a surviving database presents as cache misses that ncps refetches; a lost database with a surviving bucket leaves orphaned NARs that nothing reclaims, so delete and recreate the claim alongside it.

Regenerable holds only because `--cache-allow-put-verb` is unset, so nothing can push a locally-built path in and every path ncps holds is re-fetchable from one of the five upstreams. Enabling PUT would make the bucket the only copy of whatever was uploaded, and this section would stop being true.

`--cache-sign-narinfo=false` sidesteps the key by passing upstream signatures through untouched, but check what the clients trust before reaching for it. Passthrough means a narinfo arrives carrying only its origin's signature, so every client needs all five upstream keys, not just `cache.nixos.org-1`, which is the only one nix trusts by default. The runners are configured with the ncps key alone, so they would reject every cachix-sourced path. The other cost is that ncps can no longer serve locally-built paths.

## Unsigned narinfos

Narinfos are rows in the database, not objects: `narinfos` holds the fields, with `narinfo_signatures`, `narinfo_references` and `narinfo_nar_files` hanging off it. Only the NAR bodies are objects in the bucket.

A migration that drops a row's signatures, its references and its link to a NAR file while leaving hash and store path behind produces a row that still answers a request and never heals: ncps prefers its own copy and never re-asks upstream.
The upgrade from v0.9.4 to `v0.10.0-rc16` did exactly that to every sqlite row that predated it.
nix then discards the substitute with `warning: ignoring substitute for '/nix/store/...', as it's not signed by any of the keys in 'trusted-public-keys'`, which reads like a key mismatch and is not one.
The empty `References` is the more dangerous half; the missing signature is what stops nix acting on it.

Count them from the primary, with `$PRIMARY` resolved as in [Database backup and restore](#database-backup-and-restore):

```sh
kubectl -n nix-system exec "$PRIMARY" -c postgres -- psql ncps -c \
  "select count(*) from narinfos n
   where not exists (select 1 from narinfo_signatures s where s.narinfo_id = n.id);"
```

The repair is to delete them so the next request refetches from upstream. Back the database up first, as above:

```sh
kubectl -n nix-system exec "$PRIMARY" -c postgres -- psql ncps -c "
DELETE FROM narinfos WHERE id IN (
  SELECT n.id FROM narinfos n
  WHERE NOT EXISTS (SELECT 1 FROM narinfo_signatures s WHERE s.narinfo_id = n.id)
    AND NOT EXISTS (SELECT 1 FROM narinfo_references r WHERE r.narinfo_id = n.id)
    AND NOT EXISTS (SELECT 1 FROM narinfo_nar_files f WHERE f.narinfo_id = n.id)
);"
```

All three conditions together, so the delete cannot touch a row that is merely reference-free: a path with no dependencies is ordinary.

Re-signing in place is not an option, however tempting it looks with the key in hand. The fingerprint nix signs covers the references, and those are gone; a signature computed over the gutted row would be a valid signature on a wrong closure.

Deleting the rows orphans their NAR objects, which the LRU cron reclaims once the cache approaches `--cache-max-size`.
