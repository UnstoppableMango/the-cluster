#!/usr/bin/env bash
set -e

: "${PKI_STACK:=UnstoppableMango/pki/prod}"

pki=$(pulumi stack output thecluster --stack "$PKI_STACK" --show-secrets --json)
cert=$(printf '%s' "$pki" | yq -r '.certPem')
key=$(printf '%s' "$pki" | yq -r '.privateKeyPem')

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
cert="$cert" key="$key" yq -i \
  '.stringData."tls.crt" = strenv(cert) | .stringData."tls.key" = strenv(key)' \
  "$1"
chmod 0600 "$1"
