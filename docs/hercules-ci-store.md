# The Hercules CI agent store

Each agent keeps its Nix store on its state PVC, mounted at `/nix`.
`agent.json` sets `baseDirectory` to `/var/lib/hercules-ci-agent`, which is the mount point of the `state` volume, and `HOME` points at the same directory.
The chart's `nixStore.subPath` mounts the volume's `.local/share/nix/root/nix` at `/nix`, and its `seed-store` init container copies the image's store into it on every start:

| Path on the volume                            | Holds                                             |
| --------------------------------------------- | ------------------------------------------------- |
| `.local/share/nix/root/nix/store`             | the store, several million files                  |
| `.local/share/nix/root/nix/var/nix/gcroots`   | `per-user` and a `profiles` symlink, nothing else |
| `.local/share/nix/root/nix/var/nix/temproots` | one file per live Nix process                     |
| `.cache/nix`                                  | narinfo, fetcher, and git caches, tens of MB      |
| `work`                                        | per-task evaluation sources, tens of MB           |
| `secretState`                                 | agent secret state                                |

The store is the only part that grows.
`work`, `.cache`, and `secretState` together stay under 100MB.

## Why /nix is a mount

The store has to exist at `/nix/store` on the container's filesystem.
The agent pushes every derivation it evaluates to the cachix caches in `binary-caches.json`, and cachix builds each NAR by reading `/nix/store/<path>` directly rather than asking Nix where the store is.
With no `/nix` mount, Nix falls back to a chroot store under `$HOME`.
Nix resolves that store and cachix does not, so every push fails:

```text
/nix/store/03charld061b2a1lvm8fb2w96l90d5ig-hedgehog-1.5.tar.gz.drv: pathIsSymbolicLink:getSymbolicLinkStatus: does not exist (No such file or directory)
```

Only `.drv` paths appear, because the push happens during evaluation, before any output exists.
The subdirectory is the one Nix uses for a chroot store, so a volume that already holds one keeps its contents.

A failed task can take the agent down with it.
The worker's pipe closes, the agent throws `hGetBufSome: illegal operation (handle is closed)`, and the process exits 139.
Each restart leaves its temproots behind: 296MB of stale entries accumulated across roughly 100 restarts in one day.

## Why auto-GC is off

`min-free` and `max-free` must not be set in `extraNixConf`.

The agent registers no GC root for a task in flight.
It evaluates, hands the resulting `.drv` paths to the queue, and builds them later, with nothing rooting them in between.
`gcroots` above shows the consequence directly: it holds only the default `per-user` directory and a `profiles` symlink, no matter how many tasks are running.
This is [hercules-ci/hercules-ci-agent#105](https://github.com/hercules-ci/hercules-ci-agent/issues/105), open since 2019.
A collection triggered by any build can land between evaluation and build and delete those derivations.

## Reclaim

`apps/hercules-ci/store-gc-*.yml` runs weekly per account, staggered, because both agents sit on `gaea` and two cold stores at once is expensive.

The job checks the volume against a high-water mark and exits when it is under.
Past the mark it scales its agent to zero, waits for the pod to go, renames the store root aside, scales the agent back, and only then unlinks the renamed tree.
The rename is what keeps the outage short: the agent is down for a `mv`, not for the unlink of several million inodes.

Reclaim is all-or-nothing by necessity.
With no GC roots, `nix store gc` would walk the whole store and delete it anyway, so a rename costs the same and takes seconds.

The job pod mounts the same PVC as the agent and is pinned to `gaea`.
`ReadWriteOnce` is a per-node restriction, so both pods can hold the volume; they have to, since the scale-down runs from inside the job and the mount has to exist before the agent lets go.

The agent is always restored to one replica, on every exit path, including the one where the volume is under the mark and there is nothing to do.
That is deliberate: a run killed between the scale-down and the scale-up leaves the StatefulSet at zero, and without it the next run would free the trash, measure under the mark, and exit while the agent stayed down for good.
One replica is what Git says, so restoring it is the reconciliation.
An agent deliberately scaled to zero by hand comes back at the next run.

Reclaim is per account, so a manual run has to be repeated per account:

```sh
for account in unmango unstoppablemango; do
  kubectl create job "manual-$account-$(date +%s)" \
    --namespace hercules-ci \
    --from="cronjob/$account-hercules-ci-store-gc"
done
```

`concurrencyPolicy: Forbid` only serializes the Jobs the CronJob creates, so a manual run and a scheduled run are not serialized against each other.
The script closes that itself: it counts running pods carrying its own account's label and exits when it is not the only one.

Do not enable `driftDetection` on the agent `HelmRelease`.
It would revert the job's scale-down mid-run.

## Resizing the state volume

`persistence.size` reaches the cluster through `volumeClaimTemplates`, which Kubernetes rejects any change to:

```text
spec.volumeClaimTemplates: Invalid value: [...]: field is immutable
```

A Flux reconcile of a changed size therefore fails rather than resizing anything.
`ssd-rbd` does set `allowVolumeExpansion`, so the volume itself can grow; only the template is stuck.

Per account:

1. `kubectl delete statefulset <release> --namespace hercules-ci --cascade=orphan`, which leaves the pod and PVC running.
2. `flux reconcile helmrelease <release> --namespace hercules-ci`, which recreates the StatefulSet with the new template and adopts the orphaned pod.
3. `kubectl patch pvc state-<release>-0 --namespace hercules-ci -p '{"spec":{"resources":{"requests":{"storage":"<size>"}}}}'` to grow the existing claim, which the template alone does not do.

Step 3 is the one that is easy to skip.
Without it the template says one thing and the bound claim another, and the next agent that fills the volume hits the old ceiling.
