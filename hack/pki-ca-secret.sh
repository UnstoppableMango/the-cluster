#!/usr/bin/env bash
set -e

: "${PULUMI:=bin/pulumi}"
: "${PKI_STACK:=UnstoppableMango/pki/prod}"
: "${YQ:=yq}"

pki=$("$PULUMI" stack output thecluster --stack "$PKI_STACK" --show-secrets --json)
cert=$(printf '%s' "$pki" | "$YQ" -r '.certPem')
key=$(printf '%s' "$pki" | "$YQ" -r '.privateKeyPem')

if [ ! -f "$1" ]; then
	umask 0177
	cat > "$1" <<'EOF'
apiVersion: v1
kind: Secret
metadata: {}
type: kubernetes.io/tls
stringData: {}
EOF
fi
cert="$cert" key="$key" "$YQ" -i \
  '.stringData."tls.crt" = strenv(cert) | .stringData."tls.key" = strenv(key)' \
  "$1"
chmod 0600 "$1"
