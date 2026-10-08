#!/usr/bin/env bash
# Writes the private CA's issuer Secret stub from the UnstoppableMango/pki Key
# Vault: tls.crt is the private CA's cert followed by the policy CA's, so
# cert-manager serves the whole chain up to the root, and tls.key is the private
# CA's key. Needs an `az login` as a principal with get on the vault's secrets.
set -euo pipefail

: "${PKI_VAULT:=unmango-pki-kv}"

secret() {
	az keyvault secret show --vault-name "$PKI_VAULT" --name "$1" --query value -o tsv
}

combined=$(secret private-cert)
policy=$(secret policy-cert)
cert="$(printf '%s\n' "$combined" | openssl x509)
$(printf '%s\n' "$policy" | openssl x509)"
key=$(printf '%s\n' "$combined" | openssl pkey)

umask 0177
cat >"$1" <<'STUB'
apiVersion: v1
kind: Secret
metadata:
  name: private-ca
  namespace: cert-manager
type: kubernetes.io/tls
stringData: {}
STUB
cert="$cert" key="$key" yq -i \
	'.stringData."tls.crt" = strenv(cert) | .stringData."tls.key" = strenv(key)' \
	"$1"
chmod 0600 "$1"
