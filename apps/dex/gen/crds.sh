#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/dex"
outDir="$root/infra/crds/manifests"

helm template "$projDir" \
    --set 'dex.config.storage.type="kubernetes"' \
    --set 'dex.config.storage.config.inCluster="true"' \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --output-dir "$outDir"
