#!/bin/bash
set -eum

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/capi"
version="$(pulumi -C "$repoDir" -s codegen config get --path "versions.capi")"

"$rootDir/gen/capi/crds.sh" \
    --component core \
    --module cluster-api \
    --version "$version" \
