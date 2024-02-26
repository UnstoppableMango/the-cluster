#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/zfs-localpv"
crdDir="$root/infra/crds/manifests"

helm template "$projDir" --include-crds \
    | kubectl slice \
    --skip-non-k8s \
    --include-kind CustomResourceDefinition \
    --output-dir "$crdDir"
