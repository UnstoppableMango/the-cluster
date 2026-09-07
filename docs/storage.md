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

| StorageClass   | Pool                     | Type                                                  | Failure domain today       | Failure domain with apollo |
| -------------- | ------------------------ | ----------------------------------------------------- | -------------------------- | -------------------------- |
| `fast-rwo`     | `default-ssd`            | rbd, ssd, replicated 2                                | osd (every SSD is in zeus) | host                       |
| `standard-rwo` | `standard`               | rbd, hdd, replicated 2                                | host                       | host, size 3               |
| `standard-rwx` | `erasure-coded-standard` | CephFS data pool, hdd, replicated 2                   | host                       | host, size 3               |
| `bulk-rwx`     | `erasure-coded-data`     | CephFS data pool, hdd, EC 2+1                         | osd                        | host                       |
| `bucket`       | `s3.rgw.*`               | rgw, metadata replicated 3 on ssd, data EC 2+1 on hdd | osd                        | osd                        |

Pool names differ from class names where the pool predates the naming rule and holds data.
Ceph cannot rename a pool underneath a Rook CR, and a StorageClass is only a pointer, so the class layer carries the naming and the pool layer keeps history.

Every CephFS class points at the single filesystem `erasure-coded`.
Its first data pool, `erasure-coded-default`, is the replicated pool Ceph requires as the default data pool when an erasure-coded pool is attached; nothing provisions against it.

Deprecated aliases exist for classes that were renamed while claims still bound through the old name, because a claim's `storageClassName` is immutable:

| Alias            | Same pool as                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `ssd-rbd`        | `fast-rwo`                                                       |
| `ec-cephfs`      | `bulk-rwx`                                                       |
| `default-cephfs` | `standard-rwx` (different pool; see the consolidation procedure) |
| `ceph-bucket`    | `bucket`                                                         |

An alias is deleted once `git grep` finds no reference and `kubectl get pvc -A` shows no claim bound through it.

## Reclaim policy

`standard-rwx` and `bulk-rwx` are `Retain`.
A shared volume holds a library that took weeks to assemble, and a deleted claim must not take the subvolume with it.
`fast-rwo` and `standard-rwo` are `Delete`; block volumes belong to one workload and go with it.

## Failure domains

Two nodes carry OSDs: gaea (164 TiB HDD across 19 OSDs) and zeus (55 TiB HDD, 3.6 TiB SSD).
apollo is the third OSD host and is offline for maintenance.

A host failure domain with two hosts works for replicated size 2 and caps usable capacity at the smaller host.
Erasure coding 2+1 needs three failure domains, so `bulk-rwx` uses an osd failure domain until apollo is back.
The consequence: losing a host makes `bulk-rwx` data unavailable, and a permanent host loss loses it.
That is the trade the tier makes; anything that cannot be re-fetched belongs on `standard-rwx`.

`fast-rwo` uses an osd failure domain because every SSD is in zeus.

### Erasure-coded pools and Rook

Never change `failureDomain` on an erasure-coded pool in a CR.
Rook re-applies the erasure code profile on every reconcile with `--force`, Ceph rejects a changed profile without `--yes-i-really-mean-it`, and the failed reconcile blocks the whole CephFilesystem.
Rook never reads or sets the CRUSH rule of an existing erasure-coded pool, so the rule is changed in Ceph and the CR keeps `failureDomain: osd` with a comment naming the real rule.

Replicated pools carry `enableCrushUpdates: true`, and Rook creates a new rule named `<pool>_<domain>_<class>` when `failureDomain` or `deviceClass` changes.

### apollo cut-over

1. Add apollo and its devices to `cephClusterSpec.storage.nodes` in `infrastructure/configs/rook-ceph/cluster/helm-release-cluster.yml`, and remove any device that moved out of gaea.
2. Wait for `ceph osd tree` to show apollo's OSDs `up` and `in`, and `ceph -s` to reach `HEALTH_OK`.
3. `default-ssd.yml`: `failureDomain: host`.
4. `standard.yml` and the `standard` data pool in `cephfs.yml`: `replicated.size: 3`. The metadata pool in `cephfs.yml` too.
5. In the toolbox, swap the `erasure-coded-data` rule:

```sh
ceph osd erasure-code-profile set erasure-coded-data_ecprofile_host k=2 m=1 plugin=jerasure technique=reed_sol_van crush-failure-domain=host crush-device-class=hdd
ceph osd crush rule create-erasure erasure-coded-data_host erasure-coded-data_ecprofile_host
ceph config set osd osd_max_backfills 1
ceph osd pool set erasure-coded-data crush_rule erasure-coded-data_host
```

Rollback for step 5 is `ceph osd pool set erasure-coded-data crush_rule erasure-coded-data`; the original rule stays in the CRUSH map.

## PG autoscaler

`target_size_ratio` lives in each pool's `parameters` because Rook sets parameters on every reconcile and never unsets them, so a value set from the toolbox is not authoritative.

| Pool                              | `target_size_ratio` | `bulk` |
| --------------------------------- | ------------------- | ------ |
| `erasure-coded-data`              | 0.5                 | true   |
| `erasure-coded-standard`          | 0.2                 | true   |
| `standard`                        | 0.05                |        |
| metadata pools, `.mgr`, rgw pools | unset               |        |

Ratios sum below 1 so the autoscaler applies them as given.

## CephFS on the nodes

gaea and zeus run kernels without the `ceph` module, so the kernel mounter fails on them with `modprobe ceph` errors.
castor, agreus, and pollux have the module.
A CephFS volume that must mount on gaea or zeus sets `mounter: fuse` in its StorageClass parameters or PV `volumeAttributes`, or the host kernel gains the module.

## Subvolume inventory

Subvolumes in group `csi` on the `erasure-coded` filesystem, identified by content:

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
| `csi-vol-5e2658d2-1f8d-4b9b-83fb-5f0775851a96`                                                 | music                                | 10 GiB  |
| `csi-vol-7e86bc67-5736-4de0-88d3-5767f95c1a24`                                                 | anime                                | 13 GiB  |
| `csi-vol-953e6c76-a5ad-4b11-aec0-368258545102`, `csi-vol-e608556d-cc1c-425a-a85d-50c60aa2e7c2` | slackpack                            | tiny    |
| `csi-vol-c7b415e2-c331-4951-bf57-842e53af66a5`                                                 | one data-protection key xml          | tiny    |
| others                                                                                         | empty                                | 0       |

The rbd images in `apps/migrate` are the source of these copies.
music and anime on CephFS are far smaller than their rbd sources (4 TiB and 10 TiB provisioned), so those copies are incomplete until verified otherwise.
