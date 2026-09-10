# The Hercules CI agent store

Each agent keeps a Nix chroot store on its state PVC.
`agent.json` sets `baseDirectory` to `/var/lib/hercules-ci-agent`, which is the mount point of the `state` volume, and `HOME` points at the same directory.
Nix cannot write `/nix/store` in the image, so it falls back to a chroot store under `$HOME`:

| Path                                          | Holds                                             |
| --------------------------------------------- | ------------------------------------------------- |
| `.local/share/nix/root/nix/store`             | the store, several million files                  |
| `.local/share/nix/root/nix/var/nix/gcroots`   | `per-user` and a `profiles` symlink, nothing else |
| `.local/share/nix/root/nix/var/nix/temproots` | one file per live Nix process                     |
| `.cache/nix`                                  | narinfo, fetcher, and git caches, tens of MB      |
| `work`                                        | per-task evaluation sources, tens of MB           |
| `secretState`                                 | agent secret state                                |

The store is the only part that grows.
`work`, `.cache`, and `secretState` together stay under 100MB.

## Why auto-GC is off

`min-free` and `max-free` must not be set in `extraNixConf`.

The agent registers no GC root for a task in flight.
It evaluates, hands the resulting `.drv` paths to the queue, and builds them later, with nothing rooting them in between.
`gcroots` above shows the consequence directly: it holds only the default `per-user` directory and a `profiles` symlink, no matter how many tasks are running.
This is [hercules-ci/hercules-ci-agent#105](https://github.com/hercules-ci/hercules-ci-agent/issues/105), open since 2019.

With auto-GC enabled, a collection triggered by any build lands between evaluation and build and takes those derivations.
Every task then dies the same way:

```text
multiQuery: input "dccbw9ailj4svfjwq8mw7hf1anzsn8dw-gnutar-1.35.drv" was not saved to cache
/nix/store/616pql5q68d2asywgw3z8nhza5iycs40-flux-crd-schemas.drv: getSymbolicLinkStatus: does not exist
```

Only `.drv` paths appear, never outputs, which is what distinguishes this from a corrupt volume.

The failure compounds.
A dead task closes the worker's pipe, the agent throws `hGetBufSome: illegal operation (handle is closed)`, and the process exits 139.
The restarted agent re-evaluates, triggers GC again, and leaves its temproots behind: 296MB of stale entries accumulated across roughly 100 restarts in one day.

## Reclaim

`apps/hercules-ci/store-gc-*.yml` runs weekly per account, staggered, because both agents sit on `gaea` and two cold stores at once is expensive.

The job checks the volume against a high-water mark and exits when it is under.
Past the mark it scales its agent to zero, waits for the pod to go, renames the store root aside, scales the agent back, and only then unlinks the renamed tree.
The rename is what keeps the outage short: the agent is down for a `mv`, not for the unlink of several million inodes.

Reclaim is all-or-nothing by necessity.
With no GC roots, `nix store gc` would walk the whole store and delete it anyway, so a rename costs the same and takes seconds.

The job pod mounts the same PVC as the agent and is pinned to `gaea`.
`ReadWriteOnce` is a per-node restriction, so both pods can hold the volume; they have to, since the scale-down runs from inside the job and the mount has to exist before the agent lets go.

Run one on demand with:

```sh
kubectl create job manual-$(date +%s) --namespace hercules-ci --from=cronjob/unstoppablemango-hercules-ci-store-gc
```

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
