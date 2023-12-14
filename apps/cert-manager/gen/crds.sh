#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/cert-manager"
crdDir="$root/infra/crds/manifests"

helm template "$projDir" \
    --set 'cert-manager.installCRDs=true' \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --output-dir "$crdDir"
