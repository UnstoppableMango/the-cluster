# ramworld

`apps/ramworld` is a PalWorld server whose live save directory is a tmpfs rather than a Ceph RBD volume.

## What it measures

PalWorld autosaves the whole save directory on a timer and stalls its tick while the write completes.
On the other three servers that write lands on `standard-rwo`, which is replicated HDD, so the stall is visible to every connected player.
`ramworld` moves that directory to RAM to see whether the hitch disappears.

The comparison is against `apps/adventureworld`, which is identical apart from the storage: same image, same environment, same CPU and memory requests, and the same world, copied across so the two are measuring the same load.

## Why only Pal/Saved is a ramdisk

`/palworld` is not a save directory.
It is the whole server install, 4.6Gi of game content that steamcmd writes on first boot, and only `Pal/Saved` beneath it is the 6Mi the game rewrites on every autosave.

So the claim holds the install and the ramdisk is mounted over `Pal/Saved` inside it.
The install stays on disk where it costs nothing, the hot subtree is the only thing in RAM, and a restart re-seeds 6Mi rather than 4.6Gi.

## How the world survives a restart

A tmpfs is gone when the pod is.
Three pieces keep the world:

- `save`, an `emptyDir` with `medium: Memory` and a 2Gi `sizeLimit`, mounted at `/palworld/Pal/Saved`.
- `data`, a `standard-rwo` claim. The game mounts `palworld/` from it as the install; the helper containers mount `palworld/Pal/Saved` from it as the durable copy of the world. The game container never sees that copy, because the ramdisk is mounted over it.
- `restore`, an init container that rsyncs the durable copy into the ramdisk before the game starts, and `sync`, a native sidecar that rsyncs the other way every five minutes and once more on SIGTERM.

`sync` is declared under `initContainers` with `restartPolicy: Always`.
That ordering is what makes the shutdown flush correct: kubelet stops ordinary containers before sidecars, so `sync` receives its SIGTERM after the game has finished its own rcon save.

The window of loss is therefore the five-minute interval, and only when the pod dies without a graceful stop, such as a node power cut or an OOM kill.

## Memory accounting

A `medium: Memory` emptyDir is charged against the pod's memory limit.
The ramdisk `sizeLimit` is 2Gi and the game is allowed adventureworld's 16Gi, so the limit is 18Gi.
Raising one without the other makes a growing save directory OOM-kill the game.

The pod is pinned to `gaea` with a `nodeSelector`, which is the only node that can carry that budget.

## Abandoning the experiment

The world is on Ceph, not in RAM, so nothing is lost by deleting the app.
Remove `apps/ramworld` and the `apps-ramworld` Kustomization from `clusters/rosequartz/apps.yaml`.
The `data-ramworld-0` claim holds the last mirrored save under `palworld/Pal/Saved/`, and `standard-rwo` reclaims `Delete`, so copy it off first if it is worth keeping.
