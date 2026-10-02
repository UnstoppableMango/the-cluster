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
Each StatefulSet must be deleted before Flux can recreate it against the new class, and deleting a StatefulSet leaves its PVCs behind, which is what makes the copy procedure below possible.

Deleting the StatefulSet does not delete the claim.
Deleting the claim is what destroys data, and only on a class whose reclaim policy is `Delete`.

## Discarded data: slackerworld, necesse, xmage

The static PV pin and, for the two Deployments, the `volumeName` pin are already removed from the manifests, so each claim provisions fresh.

```sh
kubectl -n slackerworld delete statefulset slackerworld
kubectl -n slackerworld delete pvc data-slackerworld-0

kubectl -n necesse delete deployment necesse
kubectl -n necesse delete pvc necesse

kubectl -n xmage delete deployment xmage
kubectl -n xmage delete pvc db

flux reconcile kustomization apps-slackerworld apps-necesse apps-xmage
```

The old volumes on `unsafe-rbd` are `Retain`, so the rbd images outlive the claims and need deleting from the toolbox once the servers come back up.
That is the same cleanup `docs/storage.md` wants before `unsafe-metadata` and `unsafe-data` can go.

## Preserved data: adventureworld and palworld

Both hold world state worth keeping, so the volume is copied before anything is deleted.

`adventureworld` is the dangerous one: its claim is on `standard-rwo`, whose reclaim policy is `Delete`.
Deleting that claim destroys the image.
Pin the volume first and confirm it took.

### 1. Stop the server and pin the volume

```sh
kubectl -n adventureworld scale statefulset adventureworld --replicas=0
PV=$(kubectl -n adventureworld get pvc data-adventureworld-0 -o jsonpath='{.spec.volumeName}')
kubectl patch pv "$PV" -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
kubectl get pv "$PV" -o jsonpath='{.spec.persistentVolumeReclaimPolicy}{"\n"}'
```

The last line must print `Retain` before continuing.
palworld's volume is already `Retain` and statically defined in `apps/palworld/pvs.yml`, so it needs the scale to zero only.

### 2. Provision the destination

```sh
kubectl -n adventureworld apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-adventureworld-migrate
  namespace: adventureworld
spec:
  storageClassName: fast-rwo
  accessModes:
    - ReadWriteOncePod
  resources:
    requests:
      storage: 24Gi
EOF
```

For palworld, the same claim with `storageClassName: standard-rwo` and the palworld namespace and names.

### 3. Copy

Both claims are `ReadWriteOncePod`, which restricts each volume to one pod.
One pod mounting two such volumes is allowed, so a single Job does the copy.

```sh
kubectl -n adventureworld apply -f - <<'EOF'
apiVersion: batch/v1
kind: Job
metadata:
  name: migrate-storage
  namespace: adventureworld
spec:
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: copy
          image: busybox:1.36
          command:
            - sh
            - -c
            - set -e; cp -a /src/. /dst/; sync; echo "--- src ---"; du -sh /src; echo "--- dst ---"; du -sh /dst
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              memory: 256Mi
          volumeMounts:
            - name: src
              mountPath: /src
            - name: dst
              mountPath: /dst
      volumes:
        - name: src
          persistentVolumeClaim:
            claimName: data-adventureworld-0
        - name: dst
          persistentVolumeClaim:
            claimName: data-adventureworld-migrate
EOF

kubectl -n adventureworld logs -f job/migrate-storage
```

`cp -a` preserves ownership, which matters because the server runs as uid and gid 1000 via `PUID` and `PGID`.
The two `du -sh` figures at the end must match.
Treat a mismatch as a failed copy and do not continue.

### 4. Promote the copy

The StatefulSet expects the claim named `data-<app>-0`, so the new volume has to end up under that name.
Retain it, release it, and let the recreated claim bind to it by `claimRef`.

```sh
NEW=$(kubectl -n adventureworld get pvc data-adventureworld-migrate -o jsonpath='{.spec.volumeName}')
kubectl patch pv "$NEW" -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
kubectl -n adventureworld delete job migrate-storage
kubectl -n adventureworld delete pvc data-adventureworld-migrate
kubectl patch pv "$NEW" --type=json -p '[{"op":"remove","path":"/spec/claimRef"}]'
kubectl patch pv "$NEW" --type=merge -p '{"spec":{"claimRef":{"apiVersion":"v1","kind":"PersistentVolumeClaim","name":"data-adventureworld-0","namespace":"adventureworld"}}}'
```

Capture the PV for the repo, so the binding survives a rebuild:

```sh
kubectl get pv "$NEW" -o yaml \
  | yq eval 'del(.metadata.uid, .metadata.resourceVersion, .metadata.creationTimestamp,
               .metadata.annotations."pv.kubernetes.io/provisioned-by", .status)' -
```

Write that into `apps/adventureworld/pvs.yml` with the `kustomize.toolkit.fluxcd.io/prune: disabled` annotation the other apps use, and add it to the kustomization.
For palworld, replace the existing `apps/palworld/pvs.yml` rather than adding one.

### 5. Swap

```sh
kubectl -n adventureworld delete statefulset adventureworld
kubectl -n adventureworld delete pvc data-adventureworld-0
flux reconcile kustomization apps-adventureworld
```

The recreated claim binds to the pinned PV because its `claimRef` already names it.
Confirm before letting players back on:

```sh
kubectl -n adventureworld get pvc data-adventureworld-0
```

`STORAGECLASS` must read the new class and `VOLUME` must be the PV captured above.

### 6. Clean up

The pre-migration images are `Retain`, so they survive their claims and hold space until deleted from the toolbox.
adventureworld's old image is in `standard`; palworld's is in `unsafe-data`, and removing it advances the `unsafe-*` pool cleanup.

Delete them only once the servers have run against the new volumes and the worlds load correctly.
A world that loads is the only real verification; matching `du` output proves the bytes copied, not that the save is intact.
