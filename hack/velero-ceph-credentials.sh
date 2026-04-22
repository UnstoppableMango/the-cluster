#!/usr/bin/env bash
set -e

: "${KUBECTL:=kubectl}"
: "${YQ:=yq}"

key_id=$("$KUBECTL" get secret velero \
  --namespace velero-system \
  --output jsonpath='{.data.AWS_ACCESS_KEY_ID}' | base64 -d)

secret_key=$("$KUBECTL" get secret velero \
  --namespace velero-system \
  --output jsonpath='{.data.AWS_SECRET_ACCESS_KEY}' | base64 -d)

if [ ! -f "$1" ]; then
	cat > "$1" <<'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: ceph-credentials
  namespace: velero-system
stringData:
  cloud: ""
EOF
fi

cloud="[default]
aws_access_key_id=${key_id}
aws_secret_access_key=${secret_key}"

cloud="$cloud" "$YQ" -i '.stringData.cloud = strenv(cloud) | .stringData.cloud style="literal"' "$1"
