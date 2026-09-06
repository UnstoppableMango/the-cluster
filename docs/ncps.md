# ncps

`apps/nix-system/` runs [ncps](https://github.com/kalbasit/ncps), a Nix binary cache proxy.
It fronts `cache.nixos.org` and four cachix caches so builds on the cluster substitute over the LAN instead of the internet.

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

`apps/nix-system/statefulset.yml` pins `kalbasit/ncps:v0.10.0-rc16`, a release candidate, on purpose.

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
Migrations adopt a dbmate-shape `schema_migrations` table automatically for sqlite, and the on-disk layout under the storage path is unchanged, so the cache and the signing key survive the upgrade.

## Database backup and restore

ncps migrations are forward-only: `ncps migrate down` exits with an error, and the migration set is sealed by an `atlas.sum` integrity file.
A version bump that carries new migrations is therefore not reversible in place, and the PVC's `Retain` policy is not a rollback point because the migration mutates the volume it protects.
Take a backup before any bump that changes the schema, including the v0.9.4 to v0.10.0-rc16 upgrade, which converts the dbmate-shape `schema_migrations` table to goose shape.

The ncps image is distroless and carries no shell, so the copy runs from a throwaway pod that mounts the same PVC.
The PVC is RWO, so scale ncps down first, which also stops writes and gives a consistent copy:

```sh
kubectl -n nix-system scale statefulset ncps --replicas=0
kubectl -n nix-system wait --for=delete pod/ncps-0 --timeout=2m

kubectl -n nix-system apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: ncps-backup
  namespace: nix-system
spec:
  restartPolicy: Never
  containers:
    - name: backup
      image: alpine:3.23
      command: [/bin/sh, -c]
      args:
        - |
          cd /storage/var/ncps/db
          for f in db.sqlite db.sqlite-wal db.sqlite-shm; do
            [ -e "$f" ] && cp -a "$f" "$f.bak"
          done
          ls -la
          sleep 3600
      volumeMounts:
        - name: storage
          mountPath: /storage
  volumes:
    - name: storage
      persistentVolumeClaim:
        claimName: ncps
EOF

kubectl -n nix-system logs -f ncps-backup
```

The pod sleeps after copying so the files can be pulled off-cluster; delete it and scale ncps back up when done:

```sh
kubectl -n nix-system cp ncps-backup:/storage/var/ncps/db/db.sqlite.bak ./ncps-db.sqlite
kubectl -n nix-system delete pod ncps-backup
kubectl -n nix-system scale statefulset ncps --replicas=1
```

The `-wal` and `-shm` files are copied when present because a checkpoint is not guaranteed on shutdown, and a `db.sqlite` restored without its matching WAL is missing the tail of its writes.

The `.bak` copies land on the same volume, which covers a bad migration but not volume loss, so the `kubectl cp` above is what protects against the second case.

Restore is the same shape in reverse, and the manifest has to go back with it: a database rolled back to the dbmate-shape schema will not serve under the v0.10 image.

1. `kubectl -n nix-system scale statefulset ncps --replicas=0`.
2. Run the same throwaway pod and copy each `.bak` file back over its original.
3. Revert `apps/nix-system/statefulset.yml` to the previous image, flags, and dbmate init container.
4. Let Flux reconcile, then scale back to 1.

Verify a restore by reading `/pubkey` and requesting a narinfo that is known to be cached, as described below.

## Signing key

ncps signs the narinfos it serves. The key name derives from `--cache-hostname`, so it is always `ncps.thecluster.lan:...`.

`--cache-secret-key-path=/etc/ncps/cache.key` points at `apps/nix-system/signing-key-sealed.yml`, so **git holds the key and a rebuilt volume keeps the same identity**.
Without that flag ncps generates a key on first start and stores it in the `config` table of the sqlite database under key `secret_key`, in nix `name:base64` format, which makes the identity every consumer trusts depend on the PV surviving.
The sealed secret carries exactly the key that database held, so adopting the flag changed no consumer.

Read the current public key:

```sh
kubectl -n nix-system port-forward statefulset/ncps 8501:8501 &
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

The PVC binds statically to PV `pvc-45251306-071e-4cf8-a43c-89112cb0c192`, RBD image `csi-vol-86764a85-c8d5-428e-8658-882d6a1d361d` in pool `unsafe-metadata` (data in `unsafe-data`), 250 GiB, `persistentVolumeReclaimPolicy: Retain`.
The volume predates the pinkdiamond to rosequartz migration and carried over, because both clusters use the same ceph.

Confirm the image is still there before assuming the cache or its key survived:

```sh
kubectl -n rook-ceph exec deploy/rook-ceph-tools -- \
  rbd -p unsafe-metadata info csi-vol-86764a85-c8d5-428e-8658-882d6a1d361d
```

`--cache-max-size=180G` bounds the cache below the size of the volume, against the roughly 237 GiB the 250 GiB volume leaves after the ext4 reserve.

It only works paired with `--cache-lru-schedule`, which registers the cron that enforces it. A max size alone is inert and says nothing about it; a schedule alone fails to start with `ErrCacheMaxSizeRequired`. Removing one silently disables the other, so treat them as a single setting.

A run under the ceiling costs a lock and a sum of `file_size` over `nar_files`. A run that has to evict holds the cache exclusively for as long as it takes, ordered by `last_accessed_at`, deleting the NAR and its narinfo together.

## If the volume is lost

1. Delete `apps/nix-system/pvs.yml`, drop it from `kustomization.yaml`, and drop `volumeName` from `pvc.yml` so rook provisions a fresh one.
2. The signing key comes from the sealed secret, not the volume, so it is unchanged and no consumer needs re-keying.
3. The cache itself is regenerable, so there is nothing to restore. It refills from upstream on demand.

Regenerable holds only because `--cache-allow-put-verb` is unset, so nothing can push a locally-built path in and every path ncps holds is re-fetchable from one of the five upstreams. Enabling PUT would make the volume the only copy of whatever was uploaded, and this section would stop being true.

`--cache-sign-narinfo=false` sidesteps the key by passing upstream signatures through untouched, but check what the clients trust before reaching for it. Passthrough means a narinfo arrives carrying only its origin's signature, so every client needs all five upstream keys, not just `cache.nixos.org-1`, which is the only one nix trusts by default. The runners are configured with the ncps key alone, so they would reject every cachix-sourced path. The other cost is that ncps can no longer serve locally-built paths.

## Unsigned narinfos

Narinfos are rows in the sqlite database, not files: `narinfos` holds the fields, with `narinfo_signatures`, `narinfo_references` and `narinfo_nar_files` hanging off it. Only the NAR bodies are files, under `/storage/store/nar`.

The upgrade to `v0.10.0-rc16` gutted every row that predated it, dropping its signatures, its references and its link to a NAR file, leaving hash and store path behind.
A gutted row still answers a request, which is why it never heals: ncps prefers its own copy and never re-asks upstream.
nix then discards the substitute with `warning: ignoring substitute for '/nix/store/...', as it's not signed by any of the keys in 'trusted-public-keys'`, which reads like a key mismatch and is not one.
The empty `References` is the more dangerous half; the missing signature is what stops nix acting on it.

Count them, with the statefulset scaled to 0 and a throwaway pod mounting the PVC:

```sh
sqlite3 -readonly /storage/var/ncps/db/db.sqlite \
  "select count(*) from narinfos n
   where not exists (select 1 from narinfo_signatures s where s.narinfo_id = n.id);"
```

The repair is to delete them so the next request refetches from upstream. Back the database up first, as above:

```sh
sqlite3 /storage/var/ncps/db/db.sqlite "
PRAGMA foreign_keys=ON;
DELETE FROM narinfos WHERE id IN (
  SELECT n.id FROM narinfos n
  WHERE NOT EXISTS (SELECT 1 FROM narinfo_signatures s WHERE s.narinfo_id = n.id)
    AND NOT EXISTS (SELECT 1 FROM narinfo_references r WHERE r.narinfo_id = n.id)
    AND NOT EXISTS (SELECT 1 FROM narinfo_nar_files f WHERE f.narinfo_id = n.id)
);"
```

All three conditions together, so the delete cannot touch a row that is merely reference-free: a path with no dependencies is ordinary, and 628 of the surviving rows are exactly that.

Re-signing in place is not an option, however tempting it looks with the key in hand. The fingerprint nix signs covers the references, and those are gone; a signature computed over the gutted row would be a valid signature on a wrong closure.

Deleting the rows orphans their NAR files, which nothing reclaims on its own. Setting `--cache-max-size` would put the LRU cron in charge of that.
