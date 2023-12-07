#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/cert-manager"
crdDir="$root/infra/crds/manifests"

# TODO: Probably should verify values don't affect the CRDs
helm template "$projDir" \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --output-dir "$crdDir"
