# Storage

Rook manages one Ceph cluster, `pinkdiamond`, from `infrastructure/configs/rook-ceph/`.
This document records the pool layout, the StorageClass naming rule, and the procedures that change them.

## StorageClass naming

A StorageClass name is a tier plus an access mode, joined with a hyphen: `fast-rwo`, `standard-rwo`, `standard-rwx`, `bulk-rwx`.
Object storage is `bucket`.

| Tier       | Promise                                        | Cost                         |
| ---------- | ---------------------------------------------- | ---------------------------- |
| `fast`     | SSD latency, survives a disk                   | 2x                           |
| `standard` | Survives a host                                | 2x (3x with three OSD hosts) |
| `bulk`     | Cheap capacity for data that can be re-fetched | 1.5x, erasure coded          |

The name never mentions the medium, protocol, or redundancy scheme.
Those are pool properties, and pools change under a class without the class being renamed.
A consumer chooses two things, how much loss it tolerates and whether it needs a shared mount, and the name says both.

## Classes and pools

| StorageClass   | Pool                     | Type                                                  | Failure domain             | Reclaim |
| -------------- | ------------------------ | ----------------------------------------------------- | -------------------------- | ------- |
| `fast-rwo`     | `default-ssd`            | rbd, ssd, replicated 2                                | osd (every SSD is in zeus) | Delete  |
| `standard-rwo` | `standard`               | rbd, hdd, replicated 2                                | host                       | Delete  |
| `standard-rwx` | `erasure-coded-standard` | CephFS data pool, hdd, replicated 2                   | host                       | Retain  |
| `bulk-rwx`     | `erasure-coded-data`     | CephFS data pool, hdd, EC 2+1                         | osd                        | Retain  |
| `bucket`       | `s3.rgw.*`               | rgw, metadata replicated 3 on ssd, data EC 2+1 on hdd | osd                        | Delete  |

Pool names differ from class names where the pool predates the naming rule and holds data.
Ceph cannot rename a pool underneath a Rook CR, and a StorageClass is only a pointer, so the class layer carries the naming and the pool layer keeps history.

Every tier class for CephFS points at the single filesystem `erasure-coded`.
Its first data pool, `erasure-coded-default`, is the replicated pool Ceph requires as the default data pool when an erasure-coded pool is attached; nothing provisions against it.

The shared classes are `Retain` because a shared volume holds a library that took weeks to assemble, and a deleted claim must not take the subvolume with it.
The block classes are `Delete`; a block volume belongs to one workload and goes with it.

### Deprecated classes

These classes exist because a claim's `storageClassName` is immutable, so a bound claim keeps its class name until the claim is recreated.
New claims use the replacement.

| Class            | Points at                                              | Reclaim    | Replacement                                                  |
| ---------------- | ------------------------------------------------------ | ---------- | ------------------------------------------------------------ |
| `ssd-rbd`        | pool `default-ssd`, the same pool as `fast-rwo`        | Delete     | `fast-rwo`                                                   |
| `ec-cephfs`      | pool `erasure-coded-data`, the same pool as `bulk-rwx` | **Delete** | `bulk-rwx`                                                   |
| `default-cephfs` | filesystem `replicated`, pool `replicated-data`        | Retain     | `standard-rwx` (a different pool; data is copied, see below) |
| `ceph-bucket`    | object store `s3`, the same store as `bucket`          | Delete     | `bucket`                                                     |
| `unsafe-rbd`     | pools `unsafe-metadata` and `unsafe-data`              | Retain     | `standard-rwo` (a different pool; data is copied)            |

`ec-cephfs` deletes the subvolume with the claim, unlike `bulk-rwx` on the same pool.
A claim bound through `ec-cephfs` is protected by recreating it on `bulk-rwx` with `volumeName` pinned to the same volume, not by anything in the class.

A deprecated class is deleted once `git grep` finds no reference and `kubectl get pvc -A` shows no claim bound through it.

### Pools awaiting removal

| Pool                                                               | Holds                                                                            | Goes away when                                                                                                                                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unsafe-metadata`, `unsafe-data`                                   | rbd images from the previous cluster, including the `apps/migrate` media sources | every image is verified copied or abandoned, then deleted; `unsafe-metadata` is deleted before `unsafe-data` because Rook's image check only sees the metadata pool |
| filesystem `replicated` (`replicated-metadata`, `replicated-data`) | archive, music, anime, slackpack subvolumes                                      | every subvolume is copied into `erasure-coded-standard` and its consumers repointed                                                                                 |
| `velero-default.rgw.*`                                             | nothing (control and log objects only); no CR references them                    | deleted from the toolbox                                                                                                                                            |

## Failure domains

Two nodes carry OSDs: gaea (164 TiB HDD across 19 OSDs) and zeus (55 TiB HDD, 3.6 TiB SSD).
apollo is the third OSD host and is offline for maintenance.

A host failure domain with two hosts works for replicated size 2 and caps usable capacity at the smaller host.
Erasure coding 2+1 needs three failure domains, so `bulk-rwx` uses an osd failure domain until apollo is back.
With an osd failure domain a placement group can have two or three of its chunks on one host.
Losing that host makes those placement groups unavailable while it is down, and losing its disks for good loses their data.
That is the trade the tier makes; anything that cannot be re-fetched belongs on `standard-rwx`.

`fast-rwo` uses an osd failure domain because every SSD is in zeus.

To see which rule a pool uses and what the rule chooses:

```sh
ceph osd pool get erasure-coded-data crush_rule
ceph osd crush rule dump erasure-coded-data
ceph pg ls-by-pool erasure-coded-data | head
```

The `type` in the rule's `chooseleaf` or `choose` step is the failure domain; `up` in the placement group listing shows which OSDs hold each placement group.

### Erasure-coded pools and Rook

`failureDomain` on an erasure-coded pool in a CR must not change.
Rook re-applies the erasure code profile on every reconcile with `--force`, Ceph rejects a changed profile without `--yes-i-really-mean-it`, and the failed reconcile blocks the whole CephFilesystem.
Rook never reads or sets the CRUSH rule of an existing erasure-coded pool, so a different rule is applied in Ceph and the CR keeps `failureDomain: osd` with a comment naming the real rule.

`default-ssd`, `standard`, and `erasure-coded-standard` carry `enableCrushUpdates: true`.
For those pools Rook creates a rule named `<pool>_<domain>_<class>` and switches the pool to it when `failureDomain` or `deviceClass` changes.
Without that field Rook leaves the rule alone.

### apollo cut-over

1. Add apollo and its devices to `cephClusterSpec.storage.nodes` in `infrastructure/configs/rook-ceph/cluster/helm-release-cluster.yml`, and remove any device that moved out of gaea.
2. Wait for `ceph osd tree` to show apollo's OSDs `up` and `in`, and `ceph -s` to reach `HEALTH_OK`.
3. `default-ssd.yml`: `failureDomain: host`.
4. `standard.yml` and the `standard` data pool in `cephfs.yml`: `replicated.size: 3`. The metadata pool in `cephfs.yml` too.
5. In the toolbox, swap the `erasure-coded-data` rule.
   `osd_max_backfills` is cluster configuration and stays set until removed, so the last line runs after `ceph -s` is clean again.

```sh
ceph osd erasure-code-profile set erasure-coded-data_ecprofile_host k=2 m=1 plugin=jerasure technique=reed_sol_van crush-failure-domain=host crush-device-class=hdd
ceph osd crush rule create-erasure erasure-coded-data_host erasure-coded-data_ecprofile_host
ceph config set osd osd_max_backfills 1
ceph osd pool set erasure-coded-data crush_rule erasure-coded-data_host
# after recovery completes:
ceph config rm osd osd_max_backfills
```

Rollback for the rule swap is `ceph osd pool set erasure-coded-data crush_rule erasure-coded-data`; the original rule stays in the CRUSH map.

## PG autoscaler

`target_size_ratio` lives in each pool's `parameters` because Rook sets parameters on every reconcile and never unsets them, so a value set from the toolbox is not authoritative.

The ratios are relative weights.
The autoscaler divides each pool's ratio by the sum of ratios in the CRUSH root, then scales by whatever capacity `target_size_bytes` on other pools leaves free, and `ceph osd pool autoscale-status` shows the result as `EFFECTIVE RATIO`.

| Pool                              | `target_size_ratio` | Effective share | `bulk` |
| --------------------------------- | ------------------- | --------------- | ------ |
| `erasure-coded-data`              | 0.5                 | 67%             | true   |
| `erasure-coded-standard`          | 0.2                 | 27%             | true   |
| `standard`                        | 0.05                | 7%              |        |
| metadata pools, `.mgr`, rgw pools | unset               | usage based     |        |

## CephFS on the nodes

gaea and zeus run kernels without the `ceph` module, so the kernel mounter fails on them with `modprobe ceph` errors.
castor, agreus, and pollux have the module.
A CephFS volume that must mount on gaea or zeus sets `mounter: fuse` in its StorageClass parameters or PV `volumeAttributes`, or the host kernel gains the module.

## Subvolume inventory

Subvolumes in group `csi` on the `erasure-coded` filesystem, identified by mounting the filesystem read-only and listing each subvolume:

| Subvolume                                      | Content            | Size     |
| ---------------------------------------------- | ------------------ | -------- |
| `csi-vol-960fb57d-1bab-4b79-81d5-0829c1378265` | tv                 | 16.9 TiB |
| `csi-vol-546ee57b-2173-43d8-9473-6dbc15aed300` | movies             | 14.5 TiB |
| `csi-vol-48d51b52-1cf6-48f8-a9ac-a30393d62557` | movies4k           | 2.7 TiB  |
| `csi-vol-f29db30d-4718-4576-8465-fdd3744716dd` | tv4k               | 544 GiB  |
| `csi-vol-df48d152-3c42-4041-bb12-91397e2e8375` | isos               | 2 TiB    |
| `csi-vol-36775030-2857-48e3-941a-e4a4056fe594` | youtube (tubesync) | 13 GiB   |
| `csi-vol-2bc6b513-a475-4e6c-8f08-41458d085e66` | one iso            | 2 GiB    |
| `csi-vol-0dcc73da-d250-4449-9344-ae443b97f58d` | harbor job logs    | tiny     |
| `csi-vol-aa5e92d5-3bfc-43ae-b38e-3930339571b4` | harbor trivy       | tiny     |
| `csi-vol-e5ee631b-3c10-4909-873b-5c45b0f4c29b` | empty              | 0        |

On the `replicated` filesystem:

| Subvolume                                                                                      | Content                              | Size    |
| ---------------------------------------------------------------------------------------------- | ------------------------------------ | ------- |
| `csi-vol-8e6a6915-8511-4977-ab7b-9dfc294cfe72`                                                 | downloads (jdownloader, yt-dlp, src) | 6.7 TiB |
| `csi-vol-42d14972-b082-416c-9f85-c67ce2e8d369`                                                 | archive (vms)                        | 406 GiB |
| `csi-vol-5e2658d2-1f8d-4b9b-83fb-5f0775851a96`                                                 | music, 1398 files                    | 10 GiB  |
| `csi-vol-7e86bc67-5736-4de0-88d3-5767f95c1a24`                                                 | anime, 10 files                      | 13 GiB  |
| `csi-vol-953e6c76-a5ad-4b11-aec0-368258545102`, `csi-vol-e608556d-cc1c-425a-a85d-50c60aa2e7c2` | slackpack                            | tiny    |
| `csi-vol-c7b415e2-c331-4951-bf57-842e53af66a5`                                                 | one data-protection key xml          | tiny    |
| others                                                                                         | empty                                | 0       |

The rbd images claimed in `apps/migrate` are the source of these copies, and each copy counts as verified only after a job compares it against its image file by file.
The music and anime subvolumes hold 1398 and 10 files, while their rbd sources are provisioned at 4 TiB and 10 TiB, so those two copies count as incomplete until the comparison says otherwise.
