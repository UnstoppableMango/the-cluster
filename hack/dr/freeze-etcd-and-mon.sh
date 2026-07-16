#!/usr/bin/env bash
set -e

# Copies the small, fast-to-move things worth backing up before doing any
# further recovery work on the surviving nodes: the k3s etcd snapshot(s) on
# pik8s1, and the Ceph mon rocksdb store on zeus/castor if it survived.
#
# Deliberately does NOT touch the OSD block devices themselves (potentially
# many TB each across 4 nodes — imaging them wholesale isn't practical here).
# The safety measure for OSD data is procedural: don't mount/wipe/repurpose
# those disks until Priority 2 of the recovery plan is done.
#
# Usage: OUT_DIR=./frozen ./freeze-etcd-and-mon.sh

: "${OUT_DIR:=./frozen}"
: "${SSH:=ssh}"
: "${SCP:=scp}"
: "${ETCD_NODE:=pik8s1}"
: "${ETCD_SNAPSHOT_DIR:=/var/lib/rancher/k3s/server/db/snapshots}"
: "${MON_NODES:=zeus castor}"
: "${MON_DATA_GLOB:=/var/lib/rook/mon-*}"

mkdir -p "$OUT_DIR/etcd-snapshots" "$OUT_DIR/mon-data"

echo "== Listing etcd snapshots on $ETCD_NODE ==" >&2
"$SSH" "$ETCD_NODE" "sudo ls -la $ETCD_SNAPSHOT_DIR"
echo "Copying all snapshots found in $ETCD_SNAPSHOT_DIR ..." >&2
"$SSH" "$ETCD_NODE" "sudo tar -C $ETCD_SNAPSHOT_DIR -czf - ." \
	| tar -C "$OUT_DIR/etcd-snapshots" -xzf -

for node in $MON_NODES; do
	echo "== Checking for mon data on $node ($MON_DATA_GLOB) ==" >&2
	if "$SSH" "$node" "sudo sh -c 'ls -d $MON_DATA_GLOB'" 2>/dev/null; then
		mkdir -p "$OUT_DIR/mon-data/$node"
		"$SSH" "$node" "sudo tar -czf - $MON_DATA_GLOB" \
			| tar -C "$OUT_DIR/mon-data/$node" -xzf -
		echo "  -> $OUT_DIR/mon-data/$node" >&2
	else
		echo "  no mon data dir found on $node" >&2
	fi
done

echo "Done. $OUT_DIR now holds the etcd snapshot(s) and any surviving mon store(s)." >&2
echo "Move this off the scratch machine to encrypted offline storage — it contains" >&2
echo "everything etcd-restore-dump.sh needs, and the mon store (if present) is the" >&2
echo "fast path to reforming quorum without a ceph-monstore-tool rebuild." >&2
