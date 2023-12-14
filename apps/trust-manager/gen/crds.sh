#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/trust-manager"
crdDir="$root/infra/crds/manifests"

helm template "$projDir" \
    --set 'trust-manager.crds.enabled=true' \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --output-dir "$crdDir"
