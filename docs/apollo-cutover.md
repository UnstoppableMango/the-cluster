# apollo cut-over

apollo is the third OSD host.
Bringing it in converts every pool from an osd failure domain to a host failure domain, so a host can be lost without taking a pool offline.
Capacity comes from gaea, which holds 163 TiB against zeus's 55 TiB.

`docs/storage.md` describes the resulting layout.
This document is the procedure.

## What moves

Six 14 TB drives leave gaea for apollo.
The choice is six because apollo has six free bays, and these six because they are the largest drives gaea can give up while staying above zeus.

| Host   | HDD before | HDD after |
| ------ | ---------- | --------- |
| gaea   | 163.7 TiB  | 81.9 TiB  |
| zeus   | 54.6 TiB   | 54.6 TiB  |
| apollo | 0          | 76.4 TiB  |

zeus is the smallest host and therefore the cap on every host-domain pool.
Erasure coding 2+1 places one chunk per host, so usable bulk capacity is twice the smallest host, about 109 TiB.
Replicated size 3 gets 54 TiB.
Against 68 TiB stored today, of which 27 TiB is the `unsafe-data` migration source that goes away, the cap is not binding.

The capacity gaea and apollo hold above zeus's 54.6 TiB is unreachable by any host-domain pool.
Shrinking that gap means growing zeus, not shuffling more drives out of gaea.

## Identifying a physical drive

gaea's drives hang off a SAS expander, so `/dev/disk/by-path` names each one by the expander phy it is attached to, and the phy is the backplane port.
The `sdX` names are reassigned across reboots; the phy is not.

Build the map from any OSD pod on the host:

```sh
POD=$(kubectl -n rook-ceph get pod -l app=rook-ceph-osd -o wide --no-headers | awk '$7=="gaea"{print $1; exit}')
kubectl -n rook-ceph exec "$POD" -c osd -- bash -c '
	for p in /dev/disk/by-path/*-lun-0; do
		d=$(basename $(readlink -f $p))
		echo "$(basename $p) $d $(( $(cat /sys/block/$d/size) / 2097152 ))GiB"
	done | sort'
```

Join it against `ceph device ls`, which gives the serial and the OSD id for each `host:dev`.

`ceph device light` does not work here.
It requires an orchestrator backend, and Rook does not provide one, so the command fails with `ENOENT: No orchestrator configured`.

To confirm a bay before pulling, drive its activity LED from the OSD pod and watch the chassis:

```sh
kubectl -n rook-ceph exec "$POD" -c osd -- dd if=/dev/sdf of=/dev/null bs=1M count=200000 iflag=direct
```

The serial is also printed on the drive label, which settles the identification once the drive is in hand.

### gaea bay map

| Phy | Dev | Size | Serial                       | OSD    | Action  |
| --- | --- | ---- | ---------------------------- | ------ | ------- |
| 12  | sdf | 14T  | WD140EDGZ 9LK7MVXG           | osd.5  | move    |
| 13  | sde | 14T  | WD140EDGZ 9MJ3HKZU           | osd.6  | move    |
| 14  | sdc | 14T  | WD140EDGZ 9MJ404TU           | osd.7  | move    |
| 15  | sdh | 14T  | WD140EDGZ 9MJ32XAT           | osd.2  | move    |
| 16  | sda | 14T  | WD140EDGZ 9MJ3HJZU           | osd.12 | move    |
| 17  | sdb | 14T  | WD140EDGZ 9MH07NGK           | osd.9  | move    |
| 18  | sdd | 12T  | WD120EDBZ 5QG6P5NF           | osd.23 | stays   |
| 19  | sdg | 12T  | WD120EDBZ 5QG81AEF           | osd.24 | stays   |
| 20  | sdj | 12T  | WD120EDBZ 5QG6MW2F           | osd.19 | stays   |
| 21  | sdi | 12T  | WD120EDBZ 5QG649DB           | osd.20 | stays   |
| 22  | sdk | 14T  | WD140EDGZ 9LK4R8PG           | osd.21 | stays   |
| 23  | sdp | 14T  | WD140EDGZ 9LK4P5UG           | osd.22 | stays   |
| 24  | sdq | 6T   | WD6002FFWX K1JXV0SD          | osd.10 | stays   |
| 25  | sdr | 8T   | WD8001FFWX R6GYNKEY          | osd.11 | stays   |
| 26  | sdo | 1T   | ST1000NM0033 Z1W42K98        | osd.8  | retire  |
| 27  | sds | 1T   | WD10EZEX WD-WCC6Y5RH37JH     | osd.3  | retire  |
| 28  | sdt | 1T   | WD10EZEX WD-WCC6Y7ZAP2TP     | osd.0  | retire  |
| 29  | sdu | 12T  | WD120EDBZ 5QG6HVLF           | none   | reclaim |
| 33  | sdl | 1T   | ST1000NM0033 Z1W42MHB        | osd.1  | retire  |
| 34  | sdn | 0B   | SEAGATE 9WM7JRGL0000913705M8 | none   | pull    |
| 35  | sdm | 2T   | SEAGATE 9WM6BY870000C146002X | osd.4  | pull    |

The six drives to move occupy a contiguous run of phys, 12 through 17.
Phys 30, 31, and 32 are absent from the listing, so gaea has three empty bays.

The four 1 TB drives are 4 TB of the host's 163 TiB and consume four OSD slots and roughly 16 GiB of OSD memory.
Retiring them removes the worst of the weight spread: `osd.0` sits at 80% full against a cluster mean of 49%.

`osd.4` is the failing SEAGATE.
It carries reweight 0 and 0 B of data, so it is already drained and can be pulled without ceremony.
The drive on phy 34 reports 0 B and was never an OSD.

## Prerequisites

Confirm all three before touching a drive:

```sh
kubectl get node apollo                                    # Ready, not SchedulingDisabled
kubectl -n rook-ceph get job rook-ceph-osd-prepare-apollo   # Complete
ceph osd tree | sed -n '/host apollo/,/^-/p'                # both nvme OSDs up
```

Rook runs the prepare job only where it can schedule a pod, so a cordoned apollo produces no OSDs at all while still appearing in `cephClusterSpec.storage.nodes`.
The job completing is the signal that apollo is reachable and Rook can drive it.

apollo's two 960 EVOs come up under the `nvme` device class, not `ssd`, so they back no pool until step 10 reclasses them.
They are not a prerequisite for the HDD work; a `host apollo` bucket with both OSDs `up` only proves the node is usable.

apollo resolves DNS through the pihole load balancers like every other node.
A node whose image pulls fail with `Temporary failure in name resolution` is not an apollo fault; check whether both pihole replicas are running before looking anywhere else.

## Reweights

Six OSDs carry hand-set reweights that predate this work.

| OSD | Reweight |
| --- | -------- |
| 1   | 0.4      |
| 2   | 0.7      |
| 7   | 0.6      |
| 8   | 0.8      |
| 11  | 0.5      |
| 12  | 0.9      |

They were set to work around fullness under the two-host layout and they make the post-move balance wrong.
`osd.2`, `osd.7`, and `osd.12` are among the drives that move.
Reset every one to 1.0 once the cluster is balanced on three hosts, not before, because removing them now adds backfill to a cluster that is about to be rearranged anyway.

## Procedure

Each step waits for `HEALTH_OK` before the next one starts.

One warning is expected throughout and is not a gate:

```
[WRN] DEVICE_IDENT_ON: 1 devices have ident light turned on
    WDC_WD140EDGZ-11B1PA0_9MJ3HJZU ident light enabled
```

`ceph device light on` records the light state in the mgr before it asks the orchestrator to act on it.
Rook provides no orchestrator, so the command fails with `ENOENT` having already set the flag, and `ceph device light off` fails the same way without clearing it.
`ceph mgr fail` drops the state, at the cost of about 30 seconds without dashboard and Prometheus metrics on a single-mgr cluster.

Until then, the health gate means `HEALTH_OK` or `HEALTH_WARN` whose only check is `DEVICE_IDENT_ON`.
Verify with `ceph health detail` rather than the summary line, and confirm the set has not grown with `ceph device ls-lights`.

The flagged drive is osd.12 on phy 16, which is one of the six that move.
Identify drives by the `dd` blink described above, not by a lit LED.

### 1. Set the recovery pace

```sh
ceph osd set noout
```

`noout` stops Ceph from re-replicating a stopped OSD's data during the window where the drive is out of the chassis.
It is not a substitute for moving quickly.

Recovery speed is the mclock profile, not `osd_max_backfills`:

```sh
ceph config get osd osd_op_queue                          # mclock_scheduler
ceph config get osd osd_mclock_override_recovery_settings # false
```

With the mclock scheduler and that override false, `osd_max_backfills` is ignored, so setting it to 1 throttles nothing.
The control is `osd_mclock_profile`:

| Profile             | Use                                                             |
| ------------------- | --------------------------------------------------------------- |
| `high_recovery_ops` | draining a rebalance that is holding up the next step           |
| `balanced`          | the default, and what to return to before players are on        |
| `high_client_ops`   | protecting client latency while recovery runs in the background |

Set `high_recovery_ops` while a step's backfill drains, and put it back to `balanced` once `ceph -s` is clean:

```sh
ceph config set osd osd_mclock_profile high_recovery_ops
# once clean:
ceph config set osd osd_mclock_profile balanced
```

### 2. Pull the dead drives

`osd.4` on phy 35 and the phy 34 drive hold nothing.
`osd.4` carries reweight 0 and 0 B, so pulling the drive before removing the OSD costs nothing, but the daemon keeps running against a device that is gone and eventually flaps.
Stop it first, or clean up immediately after:

```sh
kubectl -n rook-ceph scale deploy rook-ceph-osd-4 --replicas=0
ceph osd out 4
ceph osd purge 4 --yes-i-really-mean-it
kubectl -n rook-ceph delete deploy rook-ceph-osd-4
```

This frees two bays on gaea and takes the cluster out of the state where a failing drive can put it in `HEALTH_ERR` and stall Rook's reconcile.

### 3. Move one drive, not six

This is the step that decides whether the rest of the plan works.
Rook activates a bluestore device wherever it finds it, so a physically moved OSD keeps its data and its id and rejoins under a new CRUSH host.
That path is not the one Rook documents, so prove it on `osd.5` before committing the other five.

```sh
kubectl -n rook-ceph scale deploy rook-ceph-osd-5 --replicas=0
```

Pull phy 12 from gaea, seat it in apollo, then remove the stale deployment and let Rook rediscover:

```sh
kubectl -n rook-ceph delete deploy rook-ceph-osd-5
kubectl -n rook-ceph delete job rook-ceph-osd-prepare-apollo --ignore-not-found
kubectl -n rook-ceph get pod -l app=rook-ceph-osd-prepare -w
```

Success is `ceph osd tree` showing `osd.5` `up` and `in` beneath `host apollo` with its weight intact.
Failure is `osd.5` not coming back, and it costs a 12.7 TiB backfill to recover: purge the id, wipe the device, and let Rook create a fresh OSD.
Decide on the fallback before starting, because the answer changes whether the remaining five are worth moving the same way.

### 4. Move the remaining five

Repeat step 3 for phys 13 through 17, one drive at a time.
Batching them is faster in wall-clock terms and gives up the ability to tell which drive caused a failure.

### 5. Retire the 1 TB drives

```sh
for id in 0 1 3 8; do ceph osd out $id; done
```

Wait for the data to drain, which is about 1.8 TiB total, then purge and pull them from phys 26, 27, 28, and 33.

### 6. Rebalance and clear the reweights

```sh
ceph osd unset noout
for id in 1 2 7 8 11 12; do ceph osd reweight $id 1.0; done
```

Let this settle to `HEALTH_OK`.
The cluster is now three hosts at 82, 55, and 76 TiB, still on osd failure domains.
Everything to this point is reversible by moving drives back.

### 7. Switch the failure domains

This is the step that is expensive to undo, because it rewrites placement for every pool.

`standard` and `erasure-coded-standard` already use a host failure domain and carry `enableCrushUpdates: true`, so raising their size is a manifest change:

- `standard.yml`: `replicated.size: 3`
- `cephfs.yml`: the metadata pool and the `standard` data pool to `replicated.size: 3`

`default-ssd` stays at `failureDomain: osd`.
apollo contributes 1 TB of NVMe against zeus's 4 TB of SATA SSD, so a host failure domain would cap `fast-rwo` at 1 TB usable, down from the 2 TB it has now.

`erasure-coded-data` needs its CRUSH rule swapped in the toolbox, because Rook never reads or sets the rule of an existing erasure-coded pool and rejects a changed profile:

```sh
ceph osd erasure-code-profile set erasure-coded-data_ecprofile_host \
	k=2 m=1 plugin=jerasure technique=reed_sol_van \
	crush-failure-domain=host crush-device-class=hdd
ceph osd crush rule create-erasure erasure-coded-data_host erasure-coded-data_ecprofile_host
ceph osd pool set erasure-coded-data crush_rule erasure-coded-data_host
```

The CR keeps `failureDomain: osd` with a comment naming the real rule.
Changing it makes Rook re-apply the profile with `--force`, Ceph rejects the change, and the failed reconcile blocks the whole CephFilesystem.

Rollback is `ceph osd pool set erasure-coded-data crush_rule erasure-coded-data`.
The original rule stays in the CRUSH map.

### 8. Update the manifests

In `infrastructure/configs/rook-ceph/cluster/helm-release-cluster.yml`, move the six device entries from the `gaea` list to the `apollo` list and delete the four 1 TB entries.
The comment block above `gaea` names three excluded drives; drop the entry for the SEAGATE that was pulled.

### 9. Return to the default pace

```sh
ceph config set osd osd_mclock_profile balanced
```

`osd_mclock_profile` is cluster configuration and stays set until changed back.
Run this only after `ceph -s` is clean.

### 10. Class apollo's NVMe as ssd

apollo's two 960 EVOs come up under the `nvme` device class, which no pool selects, so they back nothing until reclassed.
The CR carries `crushDeviceClass: ssd` for both, but Rook applies that only when it creates an OSD and never reclasses an existing one:

```sh
ceph osd crush set-device-class ssd osd.4 osd.33
```

Substitute whatever ids apollo's NVMe OSDs hold; ids are reused, so they are not stable across a purge.
This rebalances about 130 GiB inside `default-ssd`, which is why it comes last rather than during the HDD work.

`default-ssd` keeps `failureDomain: osd`.
Host domain would cap `fast-rwo` at apollo's 0.91 TiB, below the 1.4 TiB it has on an osd domain.

## Timing

The physical work is about two hours.
The backfill is not.
Step 4 rearranges 76 TiB of CRUSH placement and step 7 rewrites placement for every pool, both on spinning disks.
Plan on one to two weeks of background recovery, and do not start step 7 until step 6 has reached `HEALTH_OK`.

## Open items

`5QG6HVLF` on phy 29 is a 12 TB drive carrying a `zfs_member` signature and no OSD.
It is 11 TiB of gaea sitting idle.
Wiping it and adding it to the CR raises gaea to 92.8 TiB, which is above apollo and therefore free of any effect on the cluster's capacity cap, so it is worth doing only if the pool on it is dead.

zeus has two free ports on the HBA at `81:00.0`, phy 4 and phy 5.
zeus is the cap on every host-domain pool, so two 14 TB drives there are worth more than any further rearrangement of gaea: they would raise the bulk cap from 109 TiB to about 165 TiB.
Whether the chassis has bays behind those ports is not visible from the cluster.
