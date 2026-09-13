# The Hercules CI agent store

Each agent keeps its Nix store on the `state` volume, an `emptyDir` on gaea's local disk, mounted at `/nix`.
`agent.json` sets `baseDirectory` to `/var/lib/hercules-ci-agent`, which is the mount point of the `state` volume, and `HOME` points at the same directory.
The chart's `nixStore.subPath` mounts the volume's `.local/share/nix/root/nix` at `/nix`, and its `seed-store` init container copies the image's store into it on every start:

| Path in the volume                            | Holds                                             |
| --------------------------------------------- | ------------------------------------------------- |
| `.local/share/nix/root/nix/store`             | the store, several million files                  |
| `.local/share/nix/root/nix/var/nix/gcroots`   | `per-user` and a `profiles` symlink, nothing else |
| `.local/share/nix/root/nix/var/nix/temproots` | one file per live Nix process                     |
| `.cache/nix`                                  | narinfo, fetcher, and git caches, tens of MB      |
| `work`                                        | per-task evaluation sources, tens of MB           |
| `secretState`                                 | agent session key                                 |

The store is the only part that grows.
Nothing in the volume needs to survive a restart: the agent creates a new session key from the cluster join token, which comes from the Secret.

## Why /nix is a mount

The store has to exist at `/nix/store` on the container's filesystem.
The agent pushes every derivation it evaluates to the cachix caches in `binary-caches.json`, and cachix builds each NAR by reading `/nix/store/<path>` directly rather than asking Nix where the store is.
With no `/nix` mount, Nix falls back to a chroot store under `$HOME`.
Nix resolves that store and cachix does not, so every push fails:

```text
/nix/store/03charld061b2a1lvm8fb2w96l90d5ig-hedgehog-1.5.tar.gz.drv: pathIsSymbolicLink:getSymbolicLinkStatus: does not exist (No such file or directory)
```

Only `.drv` paths appear, because the push happens during evaluation, before any output exists.
The subdirectory is the one Nix uses for a chroot store, so Nix and cachix see the same files.

A failed task can take the agent down with it.
The worker's pipe closes, the agent throws `hGetBufSome: illegal operation (handle is closed)`, and the process exits 139.
A container restart keeps the `emptyDir`, so each restart leaves its temproots behind until the pod is replaced.

## Why auto-GC is off

`min-free` and `max-free` must not be set in `extraNixConf`.

The agent registers no GC root for a task in flight.
It evaluates, hands the resulting `.drv` paths to the queue, and builds them later, with nothing rooting them in between.
`gcroots` above shows the consequence directly: it holds only the default `per-user` directory and a `profiles` symlink, no matter how many tasks are running.
This is [hercules-ci/hercules-ci-agent#105](https://github.com/hercules-ci/hercules-ci-agent/issues/105), open since 2019.
A collection triggered by any build can land between evaluation and build and delete those derivations.

## Bounding the store

The `state` volume has `sizeLimit: 100Gi`, set through `postRenderers` on each `HelmRelease` because the chart has no value for it.
Past the limit, the kubelet evicts the pod, and the StatefulSet recreates it with an empty store that `seed-store` seeds again.
Reclaim is all-or-nothing: with no GC roots, a collection would delete the whole store anyway.

The cost of a reset:

- tasks running on the agent at eviction fail;
- the next builds start cold and substitute everything through ncps, the only substituter.

The containers request `ephemeral-storage: 100Gi`, so the scheduler reserves the store's ceiling on gaea.
They set no ephemeral-storage limit, because a container limit also counts the `emptyDir` volumes and would duplicate `sizeLimit`.

To reset a store by hand, delete the pod:

```sh
kubectl delete pod <release>-0 --namespace hercules-ci
```

To resize, change `sizeLimit` in the patch and the matching `ephemeral-storage` request together.
The change rolls the pod, which also resets the store.
