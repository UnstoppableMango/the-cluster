# The ARC runner Nix store

Every runner pod mounts `/var/lib/arc/nix` from its node at `/nix`, as a `hostPath` with `type: DirectoryOrCreate`.
One store per node, shared by every runner pod scheduled there, across every scale-set namespace, persisting past the pod and past a node reboot.

Declared in three places, identically:

| File                                      | Scope                                                    |
| ----------------------------------------- | -------------------------------------------------------- |
| `charts/arc-runner-scale-set/values.yaml` | `defaults` merged into every scale set the chart renders |
| `apps/arc-runners/helm-release.yml`       | the `defaults` for the UnstoppableMango scale sets       |
| `apps/unmango-runners/helm-release.yml`   | the org-level unmango scale set                          |

## Why the store is node-local

The image ships `/nix` empty and its `nix.conf` sets `store = local`, so the store, its database, and Nix's build directory all land on whatever is mounted at `/nix`.

An ephemeral PVC there gave every runner an empty store.
Measured in `UnstoppableMango/tdl` run 35303517998: the first `nix develop` realised 134 paths and 1516 MB from `ncps` in 112.3s, ahead of 5.3s of actual work, and the second `nix develop` in the same job took 8.2s.
That 112s was charged to every Nix job on these runners.

The rate was 13.5 MB/s, and the backing device is the likely reason.
`fast-rwo` maps to the `default-ssd` pool, and per `docs/storage.md` every SSD in the cluster is in zeus, so a runner on gaea wrote its whole store over the network, replicated twice.
A node-local store removes that write path and, after the first pod on a node, most of the fetch as well.

An `emptyDir` is still not an option: kubelet creates one mode 0777 and Nix refuses a build directory with a world-writable ancestor.

## Ownership

Kubelet creates a `DirectoryOrCreate` path with `MkdirAll(path, 0755)` as root, so the first pod on a node finds `/var/lib/arc/nix` as `root:root 0755`, and `/var/lib/arc` too.
No `fsGroup` is applied: kubelet only sets volume ownership for volumes whose mounter reports itself managed, and the hostPath mounter does not.
`init-nix` (`runAsUser: 0`, `chown runner:runner /nix && chmod 00755 /nix`) is therefore the only thing that makes the store writable, and every later pod finds the directory already `runner:runner 0755` and runs both commands as no-ops.

The `chmod` is five digits because a numeric `chmod` of four digits or fewer preserves a directory's setuid and setgid bits.
`00755` clears a setgid the node directory may carry.

`init-nix` must stay non-recursive.
The store holds millions of files, so a recursive `chown` is the mistake `docs/hercules-ci-store.md` records under `fsGroupChangePolicy`, and the container starts while jobs in other pods are building in the same directory.
One `chown` of the mount root suffices only because every pod writing there runs as uid 1000 from the same pinned image.
An image that changes the runner uid needs the node directory reset, not a recursive `chown`.

## Concurrent pods on one store

Most of this works, and for a reason worth stating rather than assuming.

A hostPath is a bind mount of one node directory, so every pod sees the same inodes on the same superblock.
`fcntl` locks and sqlite WAL shared memory cross mount namespaces and containers the same way they cross processes on a host, so `/nix/var/nix/db/db.sqlite`, the per-path `/nix/store/*.lock` files, and the global `gc.lock` all behave as they do for two concurrent `nix build`s on a workstation.
Two pods realising the same derivation serialise on the path lock and the second reuses the first's output, which is a bonus rather than a hazard.

Temproots cross pods, which is what makes garbage collection safe here.
Nix decides a `/nix/var/nix/temproots/<pid>` file is stale by trying to take a write lock on it, not by checking whether the pid exists, so a pod collecting garbage sees another pod's in-flight roots as live even though the pid in the filename means nothing in its own pid namespace.

### The one real failure mode

`findRuntimeRoots` scans `/proc` for open files, cwds, maps and environs, and from inside a container it sees only its own pod.
A store path kept alive purely by a running process in another pod, with no temproot and no GC root, is invisible to a collection and can be deleted mid-use, surfacing as `No such file or directory` on a store path partway through an unrelated job.

The exposure is narrow, because runner work happens under `nix develop -c` or `nix build`, which hold temproots for their duration.
The gap is a process that outlives the Nix invocation that fetched its closure, such as a daemon a job backgrounds.
Keeping collection rare is the mitigation; if it ever bites, register a persistent GC root for the common closure.

### GC roots do not survive the pod

`nix build` registers an indirect root under `/nix/var/nix/gcroots/auto` pointing at a `result` symlink in the pod's `_work` volume, which disappears with the pod.
Nix handles that: it reads the indirect link, finds the target missing, and unlinks the auto entry.
The same path may exist in another pod's `_work` and resolve to a different `result`, in which case Nix either roots a store path nobody asked for or warns `skipping invalid root`.
Neither breaks correctness, and a collected build output is re-substituted.

## Auto-GC

`NIX_CONFIG` on the runner container sets:

```text
min-free = 68719476736     # 64 GiB
max-free = 103079215104    # 96 GiB
```

`min-free` and `max-free` live in libstore's `LocalStore::autoGC` rather than in the daemon protocol, so they apply in this daemonless client with nothing to gate them, the same reasoning that makes the substituter settings apply as written.
Nix `statvfs`'s the filesystem backing the store, which is now the node root rather than a 75Gi RBD image, so the numbers finally measure the thing that fills.
Nix and kubelet both read available blocks, so the two are directly comparable.

64 GiB is set by gaea.
Kubelet evicts at `nodefs.available < 10%`, and 10% of gaea's 465.7 GiB root is 46.6 GiB, so any smaller floor lets kubelet evict pods before Nix ever collects.

`max-free` is what keeps a collection from being total.
Left unset it is effectively unbounded, and by Nix's reckoning the warm store is all garbage the moment a job's `nix develop` exits, since nothing roots it.
96 GiB means each collection reclaims at least 32 GiB, so collections are infrequent rather than a thrash at the boundary.
On gaea the store should grow to a few hundred GiB and essentially never collect, which is the intent for a cache on a 500 GB disk.

The known cost is agreus: 64 GiB is over half its 118 GiB root, so a store there collects near-continuously.
That is degraded but correct, and the node preference makes it rare.
The fix if it becomes a problem is a stricter affinity, not a smaller `min-free`, which would trade agreus thrash for evictions on gaea.

Confirm the settings arrived with `nix config show min-free max-free` in a job.

## Node preference

Each scale set prefers `gaea` and `zeus` with a weight-100 `nodeAffinity`.
The store is per node, so unconstrained scheduling means one copy per node and a cold store wherever traffic is thin.
Preferred rather than required, so a burst spills onto the other nodes instead of queueing.
The runner's `limits.cpu: "8"` already rules out castor and pollux.

## What nothing bounds

A hostPath is invisible to the scheduler's ephemeral-storage accounting, and the store is not charged to any pod.
`min-free` is the only bound.
Do not add `requests.ephemeral-storage` to compensate: it would reserve scheduler capacity without bounding the directory.

`/nix/var/nix/builds` is the one thing auto-GC does not reclaim.
Nix removes its own build directory on success and on failure, but a SIGKILLed Nix (evicted pod, cancelled job) leaves one behind, and the collector walks `/nix/store` rather than `var/nix/builds`.
Those directories used to die with the ephemeral PVC and now persist.
Node-side age-based cleanup belongs in `UnstoppableMango/nixos`.

## Invariants

- **uid 1000.** Every image mounting this path must run the runner as uid 1000, or the store needs resetting.
- **One Nix version.** Two images with different Nix versions sharing a store means the newer one migrates the sqlite schema. Everything is pinned to one image digest; a per-scale-set image override is a hazard.
- **One org's code.** A job can write arbitrary content into a store every later pod on that node uses, across namespaces, persistently. The ephemeral PVC bounded that to one job. This is acceptable only while every scale set runs one org's own code under one bot credential. If fork-PR execution is ever enabled, revisit, most likely as a per-namespace subdirectory under `/var/lib/arc`, at the cost of the shared closure that makes the store worth keeping.
- **No PodSecurity enforcement.** The `arc-*` and `unmango-runners` namespaces carry no `pod-security.kubernetes.io/*` labels and already admit a privileged `dind` container and `runAsUser: 0`. A hostPath admits for the same reason. If PSA labels are ever added there, the hostPath and the privileged dind fail together.

## Resetting a node's store

A corrupt database or a bad store path used to affect one pod.
It now affects every job on that node until the directory is wiped.

```sh
kubectl cordon gaea                       # keep new runners off while you work
kubectl get pods -A -o wide | grep gaea   # wait out the running ones
kubectl debug node/gaea -it --image=busybox -- rm -rf /host/var/lib/arc/nix
kubectl uncordon gaea
```

The next pod's `init-nix` recreates and takes ownership of the directory, and the first job on the node pays a cold store once.

Reverting to ephemeral PVCs means reverting the manifests and wiping `/var/lib/arc/nix` on every node that ran a runner, or the store sits there with nothing referencing it.
`docs/arc-scale-set-removal.md` has the same note: removing a scale set does not reclaim its share of the node store.
