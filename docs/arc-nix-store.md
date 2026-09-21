# The ARC runner nix store

A scale set with `nixStore: node` mounts `/var/lib/arc-nix` from its node at `/nix`.
One store per node, shared by every runner pod scheduled there across every scale-set namespace, outliving the pods and surviving a reboot.

Entries without it keep an ephemeral CSI volume, empty at the start of every job and sized by `nixStorageSize`.

| Piece                                                                  | Where                                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| The option, and the volume, initContainer and nodeSelector it rewrites | `charts/arc-runner-scale-set/templates/helmreleases.yaml` |
| `nodeStore.path` and `nodeStore.selector`                              | `charts/arc-runner-scale-set/values.yaml`                 |
| The directory, its ownership, and the build-dir reaper                 | `UnstoppableMango/nixos`, `modules/arc-runner-store`      |
| The label the selector matches                                         | `UnstoppableMango/nixos`, `clan/rosequartz-cluster.nix`   |

## Why node-local

The image ships `/nix` empty and its `nix.conf` sets `store = local`, so the store, its database and nix's build directory all land on whatever is mounted there.

Measured on `agreus`, same image, fsGroup, `NIX_CONFIG` and closure (3712 paths, 8.7 GB), varying only the volume:

| volume               | cold | warm, same pod | cold, new pod, same node |
| -------------------- | ---- | -------------- | ------------------------ |
| ephemeral `fast-rwo` | 848s | 6s             | n/a                      |
| hostPath node-local  | 241s | 7s             | 4s                       |

10.4 MB/s against 36.6 MB/s on the same bytes.
`fast-rwo` maps to `default-ssd`, and per `docs/storage.md` every SSD is in zeus, so a runner elsewhere wrote its whole store over the network, replicated twice.
That rules out ncps as the limiter, which is what decides this against a long-lived per-node PVC: that shape buys the warmth and keeps the 10.4 MB/s cold case.

An `emptyDir` is not an alternative: kubelet creates one mode 0777 and nix refuses a build directory with a world-writable ancestor.

## The path, and why the node owns it

`/var/lib/arc-nix`, not `/nix`, which is the node's own store.

`systemd.tmpfiles` creates it `0755` owned by uid 1001, the `runner` user inside `ghcr.io/unmango/actions-runner`.
That is what lets these pods run without a privileged init container: kubelet creates a `hostPath` as root, so a pod given an unprepared directory would need one to take ownership.
`init-nix` exists for the CSI volume and the template drops it from any entry on the node store.

The mount is `type: Directory`.
Kubelet fails the pod when the path is absent rather than creating a root-owned one, so a node that has not been rebuilt is a failed mount and not a store nothing can write to.

One `chown` at the node is enough only because every pod writing there runs as the same uid from the same pinned image digest.
An image that changes the runner uid needs the directory discarded, not chowned: it holds millions of files, and a recursive `chown` is the hour-long mistake `docs/hercules-ci-store.md` records.

## Invariants

The store is shared, unsandboxed (`sandbox = false`) and persistent, so it holds only as long as these do:

- **One uid.** Every scale set runs the same runner image digest.
- **One nix version.** Two versions sharing a store means the newer migrates the sqlite schema under the older.
- **One org's code.** Any job can write a store path a later job on that node consumes. This is acceptable while every scale set builds code from repositories the same person controls, and stops being acceptable the moment one runs pull requests from forks.

## Concurrent pods on one store

A hostPath is a bind mount of one node directory, so every pod sees the same inodes on the same superblock.
`fcntl` locks and sqlite WAL shared memory cross containers exactly as they cross processes on a workstation.

Safe, and for stated reasons rather than by assumption:

- `/nix/var/nix/db/db.sqlite` opens WAL with a long `busy_timeout`, and the `-shm` file is mmap'd from the same inode in every pod.
- Per-path `/nix/store/*.lock` files serialise two pods realising the same derivation, and the second reuses the first's output.
- `/nix/var/nix/gc.lock` admits one collector node-wide.

### Why nothing collects garbage

Two defects make a collection running beside live builds unsound, and both are inert while nothing collects.

**Temproots filename allocation.** `createTempRootsFile` unlinks a pre-existing `temproots/<pid>` on the stated assumption that "there can be no two processes with the same pid".
Each pod has its own PID namespace and they all start at pid 1, so collisions are ordinary.
A pod that unlinks another's temproots file leaves the owner holding a lock on an unreachable inode, and the owner's in-flight paths are unrooted and invisible to any later collector.
The liveness half is sound: a file is judged stale by attempting its write lock, not by looking up the pid, so a surviving file is read correctly across pods.

**Indirect roots are pod-relative.** `nix build` registers a root under `/nix/var/nix/gcroots/auto` pointing at a `result` in the building pod's `_work` volume.
A collector in another pod resolves that path in its own mount namespace, finds it absent and prunes the root as stale.
Nothing leaks, but a finished output is collectible while its owner still needs it.

So `min-free` and `max-free` are deliberately unset.
Reclamation belongs to a per-node job that collects only when no runner pod is on the node, modelled on `apps/hercules-ci/store-gc-*.yml`.
`auto-optimise-store` stays off for the same reason: hardlinking under concurrent access is lock contention and corruption surface for savings a collection already provides.

Both defects surface as `path '/nix/store/...' is not valid` mid-job, or `No such file or directory` on a store path, in a job that did nothing wrong.

## Node selection

`nodeStore.selector` is applied as a `nodeSelector`, so a runner only lands where the store exists.
An entry's own `nodeSelector` wins on a shared key.

`gaea` and `apollo` carry it. `zeus` does not: it has 4 GiB free of 228 GiB, already past kubelet's eviction threshold. `agreus` is too small at 119 GiB.

The store grows unaccounted: kubelet charges `hostPath` usage to no pod's `ephemeral-storage`, but the eviction manager counts it against `nodefs.available`.
`imagefs` is not a separate partition on these nodes, so the binding threshold is `imagefs.available < 15%`, about 70 GiB on gaea.
Watch it:

```sh
kubectl get --raw /api/v1/nodes/gaea/proxy/stats/summary | jq '.node.fs'
```

## Resetting a node's store

A corrupted store affects every job on that node, across every scale-set namespace, until it is discarded.

```sh
kubectl cordon gaea
# wait for running runner pods to finish
kubectl debug node/gaea -it --image=busybox -- rm -rf /host/var/lib/arc-nix
kubectl uncordon gaea
```

tmpfiles recreates the directory on the next boot, or `systemd-tmpfiles --create` recreates it immediately.
The first job afterwards pays one cold store.

`nix store verify --repair` is not automated: it is O(store), re-hashes hundreds of GiB, and would run against a store other pods are writing.

Reverting an entry to `nixStore: ephemeral` leaves the node directory behind with nothing referencing it. Discard it as above.
