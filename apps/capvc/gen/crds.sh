#!/bin/bash
set -eum

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/capvc"
version="$(pulumi -C "$repoDir" -s codegen config get --path "versions.capvc")"

"$rootDir/gen/capi/crds.sh" \
    --component infrastructure \
    --module vcluster \
    --version "$version" \
    --config "$repoDir/clusterctl.yaml"
