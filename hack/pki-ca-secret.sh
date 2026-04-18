#!/usr/bin/env bash
set -e

: "${PULUMI:=bin/pulumi}"
: "${PKI_STACK:=UnstoppableMango/pki/prod}"
: "${YQ:=yq}"

pki=$("$PULUMI" stack output thecluster --stack "$PKI_STACK" --show-secrets --json)
cert=$(printf '%s' "$pki" | "$YQ" '.certPem')
key=$(printf '%s' "$pki" | "$YQ" '.privateKeyPem')

cert=$cert key=$key "$YQ" -i \
  '.stringData."tls.crt" = strenv(cert) | .stringData."tls.key" = strenv(key)' \
  "$1"
