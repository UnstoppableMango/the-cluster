# Game server storage

Every game server in this repo holds a small RWO block volume, 10 to 24 GiB, containing world state the server writes on an autosave interval.
That write pattern is latency bound rather than throughput bound: a save stalls the server tick until it commits.

## Why the fast tier

Commit latency by device class, measured with `ceph osd perf`:

| Class | Commit latency |
| ----- | -------------- |
| ssd   | 1 to 7 ms      |
| hdd   | 28 to 544 ms   |

A world save landing on `hdd` stalls the tick for as long as the slowest OSD in the acting set takes to commit.
That is the shape of an autosave hitch, and no amount of CPU or memory fixes it.

There is no separate tier for NVMe.
Through rbd a write costs a network round trip, primary OSD processing, replication, and the acknowledgement back, which is 1 to 2 ms before any device is touched.
The device-level gap between a SATA SSD and an NVMe is roughly 40 microseconds, well under that overhead, so a tier promising NVMe latency could not deliver it.
apollo's NVMe devices carry `crushDeviceClass: ssd` and join the pool behind `fast-rwo` instead.

## Classes

| App            | Class          | Data      |
| -------------- | -------------- | --------- |
| adventureworld | `fast-rwo`     | preserved |
| palworld       | `standard-rwo` | preserved |
| slackerworld   | `fast-rwo`     | discarded |
| necesse        | `fast-rwo`     | discarded |
| xmage          | `fast-rwo`     | discarded |

palworld is archived soon, so it does not need the fast tier.
It moves only to get off `unsafe-rbd`, whose pools `docs/storage.md` lists for removal, and `standard-rwo` is the documented replacement for that class.

## The StatefulSet constraint

`volumeClaimTemplates` is immutable.
Changing `storageClassName` there makes the apply fail:

```
updates to statefulset spec for fields other than 'replicas', 'ordinals', 'template',
'updateStrategy', 'persistentVolumeClaimRetentionPolicy' and 'minReadySeconds' are forbidden
```

So the manifest change alone does nothing.
Each StatefulSet must be deleted before Flux can recreate it against the new class, and deleting a StatefulSet leaves its PVCs behind.

Deleting the StatefulSet does not delete the claim.
Deleting the claim is what destroys data, and only on a class whose reclaim policy is `Delete`.

## Order of operations

Flux cannot apply the new manifests until each StatefulSet is gone, and a Kustomization with `wait: true` sits failed until then.
Suspend all five before merging, so nothing is reapplied halfway through a migration:

```sh
for app in adventureworld palworld slackerworld necesse xmage; do
  flux suspend kustomization "apps-$app"
done
```

Merge, migrate each app below, and resume its Kustomization as the last step of its section.

## Preflight: confirm Velero works

The preserved-data migration below is a Velero backup and restore, so the data mover has to be working before anything is deleted.
The scheduled backups use the same path (`snapshotMoveData: true` in `infrastructure/configs/velero-system/schedules.yml`), so a recent one completing is the check:

```sh
velero backup get
kubectl -n velero-system get dataupload --sort-by=.metadata.creationTimestamp | tail
```

A `Completed` backup and `Completed` DataUploads mean CSI snapshots of rbd volumes and the kopia upload to the `thecluster` location both work.
If none has completed, stop and fix that first.

None of the game namespaces carry a `backup.thecluster.io/*` label, so no schedule covers them today.

## Discarded data: slackerworld, necesse, xmage

The static PV pin and, for the two Deployments, the `volumeName` pin are already removed from the manifests, so each claim provisions fresh.

A one-off backup costs a few minutes and makes "discarded" reversible for a week:

```sh
velero backup create discard-game-servers \
  --include-namespaces slackerworld,necesse,xmage \
  --snapshot-move-data --storage-location thecluster --ttl 168h --wait
```

Then delete and recreate:

```sh
kubectl -n slackerworld delete statefulset slackerworld
kubectl -n slackerworld delete pvc data-slackerworld-0

kubectl -n necesse delete deployment necesse
kubectl -n necesse delete pvc necesse

kubectl -n xmage delete deployment xmage
kubectl -n xmage delete pvc db

flux resume kustomization apps-slackerworld
flux resume kustomization apps-necesse
flux resume kustomization apps-xmage
```

`flux resume` reconciles as it resumes, and each call takes one name.

The old volumes on `unsafe-rbd` are `Retain`, so the rbd images outlive the claims and need deleting from the toolbox once the servers come back up.
That is the same cleanup `docs/storage.md` wants before `unsafe-metadata` and `unsafe-data` can go.

## Preserved data: adventureworld and palworld

Both hold world state worth keeping.
Velero backs the namespace up, the claim is deleted, and Velero restores it under the same name with the new class.
The data mover writes the restored volume through a fresh claim, so there is no copy Job, no `claimRef` rewrite, and no PV to capture into the repo: the restored claim is an ordinary dynamically provisioned one, and the recreated StatefulSet adopts it by name.

Run the steps once per app with these set:

| App            | `APP`            | `FROM`         | `TO`           |
| -------------- | ---------------- | -------------- | -------------- |
| adventureworld | `adventureworld` | `standard-rwo` | `fast-rwo`     |
| palworld       | `palworld`       | `unsafe-rbd`   | `standard-rwo` |

```sh
APP=adventureworld FROM=standard-rwo TO=fast-rwo
```

Namespace, StatefulSet, and Kustomization names all follow `$APP`, and the claim is `data-$APP-0`.

### 1. Stop the server and pin the old volume

```sh
kubectl -n "$APP" scale statefulset "$APP" --replicas=0
kubectl -n "$APP" wait --for=delete pod "$APP-0" --timeout=5m
OLD=$(kubectl -n "$APP" get pvc "data-$APP-0" -o jsonpath='{.spec.volumeName}')
kubectl patch pv "$OLD" -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
kubectl get pv "$OLD" -o jsonpath='{.spec.persistentVolumeReclaimPolicy}{"\n"}'
```

The last line must print `Retain` before continuing.
adventureworld's volume is on `standard-rwo`, which reclaims with `Delete`, so without this deleting the claim destroys the image.
palworld's is already `Retain`; the patch is a no-op there.

Scaling to zero first means the backup captures a world the server is not writing to.

### 2. Back up

```sh
velero backup create "migrate-$APP" \
  --include-namespaces "$APP" \
  --snapshot-move-data --storage-location thecluster --ttl 720h --wait
velero backup describe "migrate-$APP" --details
```

`Phase` must be `Completed` and the details must list one DataUpload for `data-$APP-0`, also `Completed`.
`PartiallyFailed` is a failure here.

### 3. Map the storage class

Velero rewrites a restored claim's class through a plugin ConfigMap.
It applies to every restore while it exists, so it is created for this step and deleted in step 5, and never committed:

```sh
kubectl -n velero-system create configmap change-storage-class \
  --from-literal="$FROM=$TO"
kubectl -n velero-system label configmap change-storage-class \
  velero.io/plugin-config= velero.io/change-storage-class=RestoreItemAction
```

### 4. Swap

```sh
kubectl -n "$APP" delete statefulset "$APP"
kubectl -n "$APP" delete pvc "data-$APP-0"

velero restore create "migrate-$APP" \
  --from-backup "migrate-$APP" \
  --include-resources persistentvolumeclaims \
  --wait
velero restore describe "migrate-$APP" --details

kubectl -n "$APP" get pvc "data-$APP-0" \
  -o custom-columns=STATUS:.status.phase,CLASS:.spec.storageClassName,VOLUME:.spec.volumeName
```

The restore must be `Completed` with one `Completed` DataDownload, and the claim must be `Bound` on `$TO`.
`VOLUME` must differ from `$OLD`.

### 5. Recreate the server

```sh
kubectl -n velero-system delete configmap change-storage-class
flux resume kustomization "apps-$APP"
kubectl -n "$APP" rollout status statefulset "$APP"
```

Flux recreates the StatefulSet, whose template now names `$TO`, and its pod mounts the restored claim.
Join the server and confirm the world loads before letting players back on.
A world that loads is the only real verification; a completed restore proves the bytes moved, not that the save is intact.

### Rollback

Until step 6 the old image still exists, and the backup holds a copy for 30 days.
To go back to the old volume, scale to zero, delete the new claim, clear the old PV's `claimRef` so it is `Available`, and recreate the claim against it:

```sh
kubectl -n "$APP" scale statefulset "$APP" --replicas=0
kubectl -n "$APP" delete pvc "data-$APP-0"
kubectl patch pv "$OLD" --type=json -p '[{"op":"remove","path":"/spec/claimRef"}]'
```

The StatefulSet template names `$TO`, so the claim recreated against `$OLD` (with `volumeName: $OLD` and `storageClassName: $FROM`) has to be applied by hand, with Flux suspended, until the manifest is reverted.

### 6. Clean up

Delete the old images only once the servers have run against the new volumes and the worlds load.
They are `Retain`, so they survive their claims and hold space until then:

```sh
kubectl delete pv "$OLD"
```

then remove the rbd image from the toolbox.
adventureworld's old image is in `standard`; palworld's is in `unsafe-data`, and removing it advances the `unsafe-*` pool cleanup.
palworld's PV was statically defined in `apps/palworld/pvs.yml`; that file is already gone from the repo, and the PV carried `kustomize.toolkit.fluxcd.io/prune: disabled`, so Flux leaves it for this step rather than deleting it.

The `migrate-*` backups expire on their own after 30 days.
