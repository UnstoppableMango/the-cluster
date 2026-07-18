#!/usr/bin/env bash
set -e

# Offline recovery of a k3s etcd snapshot, purely so we can dump every
# Secret/ConfigMap out of it. Run this on a SCRATCH machine, not back onto a
# live pik8s node.
#
# This runs a throwaway single-node etcd directly against the restored data
# -- NOT a full k3s server. k3s hardcodes agent config under /etc/rancher
# regardless of --data-dir (even with --disable-agent), so bringing up a
# real API server requires root. We don't need one: k3s's storage format is
# plain protobuf-wrapped Kubernetes objects with no compression or
# encryption (no EncryptionConfiguration on this cluster), so string/byte
# fields -- secret data, PEM blocks, fsid, keys -- come back as readable
# plaintext substrings straight out of etcdctl's raw get output.
#
# Requires: etcdutl, etcd, etcdctl (ship together in an etcd release
# tarball). None of these are in the repo's nix devshell (this is a one-off
# DR tool, not a day-to-day dependency) -- install/copy them onto the
# scratch box separately.
#
# Usage: SNAPSHOT=/path/to/snapshot OUT_DIR=./etcd-dump ./etcd-restore-dump.sh

: "${SNAPSHOT:?set SNAPSHOT to the path of the k3s etcd snapshot file}"
: "${OUT_DIR:=./etcd-dump}"
: "${RESTORE_DIR:=${OUT_DIR}/restored}"
: "${ETCDUTL:=etcdutl}"
: "${ETCD:=etcd}"
: "${ETCDCTL:=etcdctl}"
: "${CLIENT_URL:=http://127.0.0.1:2379}"
: "${PEER_URL:=http://127.0.0.1:2380}"

mkdir -p "$OUT_DIR"

echo "== Restoring $SNAPSHOT into $RESTORE_DIR ==" >&2
"$ETCDUTL" snapshot restore "$SNAPSHOT" \
	--data-dir "$RESTORE_DIR" \
	--skip-hash-check

echo "== Starting a throwaway single-node etcd against the restored data ==" >&2
"$ETCD" \
	--data-dir "$RESTORE_DIR" \
	--name default \
	--initial-cluster "default=$PEER_URL" \
	--initial-advertise-peer-urls "$PEER_URL" \
	--listen-peer-urls "$PEER_URL" \
	--listen-client-urls "$CLIENT_URL" \
	--advertise-client-urls "$CLIENT_URL" \
	--force-new-cluster \
	>"$OUT_DIR/etcd.log" 2>&1 &
ETCD_PID=$!
trap 'kill "$ETCD_PID" 2>/dev/null' EXIT

echo "== Waiting for etcd to answer ==" >&2
until "$ETCDCTL" --endpoints="$CLIENT_URL" endpoint health >/dev/null 2>&1; do
	if ! kill -0 "$ETCD_PID" 2>/dev/null; then
		echo "etcd exited before it came up -- check $OUT_DIR/etcd.log" >&2
		exit 1
	fi
	sleep 1
done

echo "== Dumping all Secrets and ConfigMaps (raw etcd values) to $OUT_DIR ==" >&2
"$ETCDCTL" --endpoints="$CLIENT_URL" get /registry/secrets --prefix >"$OUT_DIR/all-secrets.raw"
"$ETCDCTL" --endpoints="$CLIENT_URL" get /registry/configmaps --prefix >"$OUT_DIR/all-configmaps.raw"
strings "$OUT_DIR/all-secrets.raw" >"$OUT_DIR/all-secrets-strings.txt"
chmod 600 "$OUT_DIR"/all-secrets* "$OUT_DIR"/all-configmaps*

echo "== Pulling out the specific crown-jewel secrets ==" >&2
"$ETCDCTL" --endpoints="$CLIENT_URL" get /registry/secrets/flux-system/sealed-secrets-key --prefix \
	>"$OUT_DIR/sealed-secrets-keys.raw" || echo "  (no sealed-secrets-key* entries -- check all-secrets-strings.txt manually)" >&2
"$ETCDCTL" --endpoints="$CLIENT_URL" get /registry/secrets/rook-ceph/rook-ceph-mon \
	>"$OUT_DIR/rook-ceph-mon.raw" || echo "  (rook-ceph-mon not found -- check all-secrets-strings.txt manually)" >&2
"$ETCDCTL" --endpoints="$CLIENT_URL" get /registry/secrets/cert-manager/thecluster-io-ca \
	>"$OUT_DIR/thecluster-io-ca.raw" || echo "  (thecluster-io-ca not found -- check all-secrets-strings.txt manually)" >&2
for f in sealed-secrets-keys rook-ceph-mon thecluster-io-ca; do
	strings "$OUT_DIR/$f.raw" >"$OUT_DIR/$f-strings.txt" 2>/dev/null || true
done
chmod 600 "$OUT_DIR"/*.raw "$OUT_DIR"/*-strings.txt 2>/dev/null || true

echo "== Also useful: rook-ceph-mon-endpoints ConfigMap (old mon IPs/node mapping) ==" >&2
"$ETCDCTL" --endpoints="$CLIENT_URL" get /registry/configmaps/rook-ceph/rook-ceph-mon-endpoints \
	>"$OUT_DIR/rook-ceph-mon-endpoints.raw" || true
chmod 600 "$OUT_DIR/rook-ceph-mon-endpoints.raw" 2>/dev/null || true

echo "Done. Everything under $OUT_DIR contains decrypted secrets -- treat it like the" >&2
echo "crown jewels it is: move it to encrypted offline storage and delete it from this" >&2
echo "scratch machine once vaulted. Do not commit any of it to git." >&2
echo >&2
echo "Values are raw etcd get output, not clean YAML -- there's no real apiserver here" >&2
echo "to decode the protobuf into objects. Read the *-strings.txt files and grep for" >&2
echo "the field name you want (fsid, ceph-secret, ceph-username, mon-secret, tls.key," >&2
echo "tls.crt, BEGIN ...). Every sealed-secrets-key* entry is labeled 'active' by" >&2
echo "design -- the controller keeps all historical keys loaded so it can decrypt old" >&2
echo "data -- import all of them, not just one." >&2
