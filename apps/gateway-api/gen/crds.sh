#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/gateway-api"
outDir="$root/infra/crds/manifests"
version="$(pulumi -C "$projDir" -s codegen config get --path 'versions.gatewayApi')"
channel="$(pulumi -C "$projDir" -s codegen config get channel)"

curl -sSL "https://github.com/kubernetes-sigs/gateway-api/releases/download/$version/$channel-install.yaml" \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$outDir"
