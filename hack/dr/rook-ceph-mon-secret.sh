#!/usr/bin/env bash
set -e

if [ "$#" -ne 1 ] || [ -z "$1" ]; then
	echo "Usage: $0 <output-file>" >&2
	echo "Pulls the rook-ceph-mon cluster identity (fsid/mon-secret/ceph-secret/ceph-username)" >&2
	echo "out of the infra/ceph Pulumi stack config and writes a hack/secrets stub for it." >&2
	exit 1
fi

: "${PULUMI:=pulumi}"
: "${YQ:=yq}"
: "${STACK:=pinkdiamond}"
: "${CEPH_DIR:=infra/ceph}"

fsid=$("$PULUMI" config get fsid --cwd "$CEPH_DIR" --stack "$STACK" --show-secrets)
mon_secret=$("$PULUMI" config get mon-secret --cwd "$CEPH_DIR" --stack "$STACK" --show-secrets)
ceph_secret=$("$PULUMI" config get ceph-secret --cwd "$CEPH_DIR" --stack "$STACK" --show-secrets)
ceph_username=$("$PULUMI" config get ceph-username --cwd "$CEPH_DIR" --stack "$STACK" --show-secrets)

if [ ! -f "$1" ]; then
	umask 0177
	cat > "$1" <<'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: rook-ceph-mon
  namespace: rook-ceph
  finalizers:
    - ceph.rook.io/disaster-protection
type: kubernetes.io/rook
stringData:
  fsid: ""
  mon-secret: ""
  ceph-secret: ""
  ceph-username: ""
EOF
fi

fsid="$fsid" mon_secret="$mon_secret" ceph_secret="$ceph_secret" ceph_username="$ceph_username" \
  "$YQ" -i '
    .stringData.fsid = strenv(fsid) |
    .stringData."mon-secret" = strenv(mon_secret) |
    .stringData."ceph-secret" = strenv(ceph_secret) |
    .stringData."ceph-username" = strenv(ceph_username)
  ' "$1"
chmod 0600 "$1"

echo "Wrote $1" >&2
echo "Cross-check these values against:" >&2
echo "  - the apps/rook stack (same 4 keys, should be identical)" >&2
echo "  - the rook-ceph-mon Secret recovered from the pik8s1 etcd snapshot dump (etcd-restore-dump.sh)" >&2
echo "before trusting this as the value to seed the new cluster's rook-ceph-mon Secret." >&2
