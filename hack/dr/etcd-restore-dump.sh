#!/usr/bin/env bash
set -e

# Offline recovery of a k3s etcd snapshot into a throwaway single-node control
# plane, purely so we can dump every Secret/ConfigMap out of it. Run this on a
# SCRATCH machine, not back onto a live pik8s node — it starts a real (if
# temporary) k3s server bound to loopback.
#
# Requires: etcdutl (or `k3s etcd-snapshot` restore path), the k3s binary,
# kubectl. None of these are in the repo's nix devshell (this is a one-off DR
# tool, not a day-to-day dependency) — install/copy them onto the scratch box
# separately, e.g. `curl -sfL https://get.k3s.io -o install-k3s.sh` (do not
# run the installer, just extract the `k3s` binary it downloads) or grab a
# matching etcd release tarball for `etcdutl`.
#
# Usage: SNAPSHOT=/path/to/snapshot OUT_DIR=./etcd-dump ./etcd-restore-dump.sh

: "${SNAPSHOT:?set SNAPSHOT to the path of the k3s etcd snapshot file}"
: "${OUT_DIR:=./etcd-dump}"
: "${RESTORE_DIR:=${OUT_DIR}/restored}"
: "${K3S_DATA_DIR:=${OUT_DIR}/k3s-data}"
: "${ETCDUTL:=etcdutl}"
: "${K3S:=k3s}"
: "${KUBECTL:=kubectl}"

mkdir -p "$OUT_DIR"

echo "== Restoring $SNAPSHOT into $RESTORE_DIR ==" >&2
"$ETCDUTL" snapshot restore "$SNAPSHOT" \
	--data-dir "$RESTORE_DIR" \
	--skip-hash-check

echo "== Starting a throwaway single-node k3s server against the restored data ==" >&2
echo "   (Ctrl-C once the dump below finishes)" >&2

# k3s wants its own etcd data dir layout under server/db/etcd; drop the
# restored member data in place instead of pointing --data-dir straight at
# $RESTORE_DIR so k3s doesn't try to reinitialize it.
mkdir -p "$K3S_DATA_DIR/server/db/etcd"
cp -a "$RESTORE_DIR"/. "$K3S_DATA_DIR/server/db/etcd/"

"$K3S" server \
	--data-dir "$K3S_DATA_DIR" \
	--cluster-init \
	--disable-agent \
	--disable coredns,servicelb,traefik,local-storage,metrics-server \
	--bind-address 127.0.0.1 \
	--https-listen-port 16443 \
	&
K3S_PID=$!
trap 'kill "$K3S_PID" 2>/dev/null' EXIT

echo "== Waiting for the temp API server to answer =="
export KUBECONFIG="$K3S_DATA_DIR/server/cred/admin.kubeconfig"
until "$KUBECTL" get --raw=/healthz >/dev/null 2>&1; do
	sleep 2
done

echo "== Dumping all Secrets and ConfigMaps to $OUT_DIR ==" >&2
"$KUBECTL" get secrets -A -o yaml > "$OUT_DIR/all-secrets.yaml"
"$KUBECTL" get configmaps -A -o yaml > "$OUT_DIR/all-configmaps.yaml"
chmod 600 "$OUT_DIR/all-secrets.yaml"

echo "== Pulling out the specific crown-jewel secrets ==" >&2
"$KUBECTL" get secret -n flux-system \
	-l sealedsecrets.bitnami.com/sealed-secrets-key=active \
	-o yaml > "$OUT_DIR/sealed-secrets-key.yaml" || echo "  (sealed-secrets key not found — check all-secrets.yaml manually)" >&2
"$KUBECTL" get secret -n rook-ceph rook-ceph-mon \
	-o yaml > "$OUT_DIR/rook-ceph-mon.yaml" || echo "  (rook-ceph-mon not found — check all-secrets.yaml manually)" >&2
"$KUBECTL" get secret -n cert-manager thecluster-io-ca \
	-o yaml > "$OUT_DIR/thecluster-io-ca.yaml" || echo "  (thecluster-io-ca not found — check all-secrets.yaml manually)" >&2
chmod 600 "$OUT_DIR"/*.yaml

echo "== Also useful: rook-ceph-mon-endpoints ConfigMap (old mon IPs/node mapping) ==" >&2
"$KUBECTL" get configmap -n rook-ceph rook-ceph-mon-endpoints \
	-o yaml > "$OUT_DIR/rook-ceph-mon-endpoints.yaml" || true

echo "Done. Everything under $OUT_DIR contains decrypted secrets — treat it like the" >&2
echo "crown jewels it is: move it to encrypted offline storage and delete it from this" >&2
echo "scratch machine once vaulted. Do not commit any of it to git." >&2
