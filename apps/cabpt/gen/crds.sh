#!/bin/bash
set -eum

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/cabpt"
cabptVersion="$(pulumi -C "$repoDir" -s codegen config get --path "versions.cabpt")"

"$rootDir/gen/capi/crds.sh" \
    --component bootstrap \
    --module talos \
    --version "$cabptVersion" \
