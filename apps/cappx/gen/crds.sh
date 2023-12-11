#!/bin/bash
set -eum

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/cappx"
version="$(pulumi -C "$repoDir" -s codegen config get --path "versions.cappx")"

"$rootDir/gen/capi/crds.sh" \
    --component infrastructure \
    --module proxmox \
    --version "$version" \
    --config "$repoDir/clusterctl.yaml"
