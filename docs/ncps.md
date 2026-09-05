# ncps

`apps/nix-system/` runs [ncps](https://github.com/kalbasit/ncps), a Nix binary cache proxy.
It fronts `cache.nixos.org` and `nix-community.cachix.org` so builds on the cluster substitute over the LAN instead of the internet.

Reached two ways:

- `http://ncps.nix-system.svc.cluster.local:8501` from inside the cluster. This is what the ARC runners use.
- `https://ncps.thecluster.lan` from the LAN, through the nginx Gateway.

Runner pods use the in-cluster Service. The Gateway has an HTTPS-443 listener only, and its certificate comes from the private `thecluster.lan` ClusterIssuer that pods do not trust, so the LAN hostname is not usable from inside.

## Version

`apps/nix-system/statefulset.yml` pins `kalbasit/ncps:v0.10.0-rc16`, a release candidate, on purpose.

`nix-community.cachix.org` serves NARs under opaque object keys (`nar/<uuid>.nar.zst`) rather than the hash-named URLs `cache.nixos.org` uses.
The narinfo `URL:` field is an opaque path by spec, so this is valid upstream behavior, but ncps through v0.9.4 parses that filename as a nix hash and reuses it as its own storage key.
Every cachix-backed narinfo therefore fails with `invalid nar hash` and returns HTTP 500, and nix treats a 500 as a hard error instead of falling through to the next substituter, so runner builds fail outright.
See [kalbasit/ncps#1329](https://github.com/kalbasit/ncps/issues/1329).

The fix landed in `v0.10.0-rc10`.
There is no v0.9 backport and no stable v0.10.0, so the RC is the only release that serves cachix paths.

If the RC misbehaves, the mitigation that does not require downgrading is dropping `--cache-upstream-url=https://nix-community.cachix.org` and its `--cache-upstream-public-key`.
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

ncps signs the narinfos it serves. The key name derives from `--cache-hostname`, so it is always `ncps.thecluster.lan:...`, but the material lives in the sqlite database at `/storage/var/ncps/db/db.sqlite` on the PVC.
No `--cache-secret-key-path` is set, so **key survival is exactly PV survival**.

Read the current public key:

```sh
kubectl -n nix-system port-forward statefulset/ncps 8501:8501 &
curl -sS http://127.0.0.1:8501/pubkey; echo
```

The current value is `ncps.thecluster.lan:pAJGNVSRmG7gCDSOAaiHDxLFUSdys5Pk0XvcJ5803Dw=`.
Anything consuming ncps as a substituter needs it in `extra-trusted-public-keys`.

Note that this is not the key an older, commented-out entry in `UnstoppableMango/nixos` records.
The volume survived the migration, but the key material did not, and the name is derived from `--cache-hostname` so both spell `ncps.thecluster.lan:`.
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

Nothing bounds the cache below the size of the volume; `--cache-max-size` is available but not set.

## If the volume is lost

1. Delete `apps/nix-system/pvs.yml`, drop it from `kustomization.yaml`, and drop `volumeName` from `pvc.yml` so rook provisions a fresh one.
2. ncps mints a new signing key under the same name. Every `extra-trusted-public-keys` entry listed above is now wrong and must be replaced from `/pubkey`.
3. The cache itself is regenerable, so there is nothing to restore. It refills from upstream on demand.

To sidestep the key entirely, `--cache-sign-narinfo=false` passes upstream signatures through untouched, which nix already trusts. The cost is that ncps can no longer serve locally-built paths.
