#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/minio-operator"
outDir="$root/infra/crds/manifests"

helm template "$projDir" \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --output-dir "$outDir"
