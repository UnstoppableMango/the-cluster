# ncps

`apps/nix-system/` runs [ncps](https://github.com/kalbasit/ncps), a Nix binary cache proxy.
It fronts `cache.nixos.org` and `nix-community.cachix.org` so builds on the cluster substitute over the LAN instead of the internet.

Reached two ways:

- `http://ncps.nix-system.svc.cluster.local:8501` from inside the cluster. This is what the ARC runners use.
- `https://ncps.thecluster.lan` from the LAN, through the nginx Gateway.

Runner pods use the in-cluster Service. The Gateway has an HTTPS-443 listener only, and its certificate comes from the private `thecluster.lan` ClusterIssuer that pods do not trust, so the LAN hostname is not usable from inside.

## Signing key

ncps signs the narinfos it serves. The key name derives from `--cache-hostname`, so it is always `ncps.thecluster.lan:...`, but the material lives in the sqlite database at `/storage/var/ncps/db/db.sqlite` on the PVC.
No `--cache-secret-key-path` is set, so **key survival is exactly PV survival**.

Read the current public key:

```sh
kubectl -n nix-system port-forward statefulset/ncps 8501:8501 &
curl -sS http://127.0.0.1:8501/pubkey; echo
```

Anything consuming ncps as a substituter needs that value in `extra-trusted-public-keys`.
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
