# ramworld

`apps/ramworld` is a PalWorld server whose live save directory is a tmpfs rather than a Ceph RBD volume.

## What it measures

PalWorld autosaves the whole save directory on a timer and stalls its tick while the write completes.
On the other three servers that write lands on `standard-rwo`, which is replicated HDD, so the stall is visible to every connected player.
`ramworld` moves the same directory to RAM to see whether the hitch disappears.

The comparison is against `apps/adventureworld`, which is identical apart from the storage: same image, same environment, same CPU and memory requests.

## How the world survives a restart

A tmpfs is gone when the pod is.
Three pieces keep the world:

- `save`, an `emptyDir` with `medium: Memory`, mounted at `/palworld` in the game container.
- `backup`, a `standard-rwo` claim, mounted at `/backup` in the helper containers only.
- `restore`, an init container that rsyncs `/backup/palworld` into the ramdisk before the game starts, and `sync`, a native sidecar that rsyncs the other way every five minutes and once more on SIGTERM.

`sync` is declared under `initContainers` with `restartPolicy: Always`.
That ordering is what makes the shutdown flush correct: kubelet stops ordinary containers before sidecars, so `sync` receives its SIGTERM after the game has finished its own rcon save.

The window of loss is therefore the five-minute interval, and only when the pod dies without a graceful stop, such as a node power cut or an OOM kill.

## Memory accounting

A `medium: Memory` emptyDir is charged against the pod's memory limit.
The ramdisk `sizeLimit` is 8Gi and the game is allowed adventureworld's 16Gi, so the limit is 24Gi.
Raising one without the other makes a growing save directory OOM-kill the game.

The pod is pinned to `gaea` with a `nodeSelector`, which is the only node that can carry that budget.

## Abandoning the experiment

The world is on Ceph, not in RAM, so nothing is lost by deleting the app.
Remove `apps/ramworld` and the `apps-ramworld` Kustomization from `clusters/rosequartz/apps.yaml`; the `backup-ramworld-0` claim holds the last mirrored save under `palworld/`, and `standard-rwo` reclaims `Delete`, so copy it off first if it is worth keeping.
