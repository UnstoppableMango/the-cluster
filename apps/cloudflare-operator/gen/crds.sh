#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/cloudflare-operator"
crdDir="$root/infra/crds/manifests"

kustomize build "$projDir" \
  | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$crdDir"
