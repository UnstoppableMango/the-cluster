#!/usr/bin/env bash
set -e

# Read-only inspection of the surviving Ceph OSD disks on the storage nodes.
# SSHes into each node and dumps LVM/ceph-volume metadata so we can confirm
# the OSDs' fsid/osd-id/keyring tags are intact before attempting to adopt
# them into a fresh mon quorum. Does not modify anything.
#
# Usage: OUT_DIR=./osd-inspect ./ceph-osd-inspect.sh [node ...]
# Defaults to the known storage nodes if none are given.

: "${OUT_DIR:=./osd-inspect}"
: "${SSH:=ssh}"
NODES=("$@")
if [ "${#NODES[@]}" -eq 0 ]; then
	NODES=(zeus gaea castor pollux)
fi

mkdir -p "$OUT_DIR"

for node in "${NODES[@]}"; do
	echo "== $node ==" >&2
	{
		echo "### lsblk"
		"$SSH" "$node" 'lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINT' || echo "lsblk failed"
		echo
		echo "### ceph-volume lvm list"
		"$SSH" "$node" 'sudo ceph-volume lvm list' || echo "ceph-volume lvm list failed (is the ceph-volume tool installed on this host, or only inside the old rook container images?)"
		echo
		echo "### pvs/vgs/lvs"
		"$SSH" "$node" 'sudo pvs; sudo vgs; sudo lvs -o +tags' || echo "lvm inspection failed"
	} > "$OUT_DIR/$node.txt" 2>&1
	echo "  -> $OUT_DIR/$node.txt" >&2
done

echo "Done. Check each file for: matching cluster fsid across all OSDs, an osd-id per" >&2
echo "device, and an intact osd keyring tag (ceph.osd_fsid / ceph.cluster_fsid / ceph.osd_id" >&2
echo "LVM tags under 'lvs -o +tags'). Devices missing these tags likely need the old" >&2
echo "rook/ceph container to inspect properly — ceph-volume may not be installed on the" >&2
echo "bare host if OSDs only ever ran inside the rook osd-prepare/osd containers." >&2
