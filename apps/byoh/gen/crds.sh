#!/bin/bash
set -eum

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/byoh"
version="$(pulumi -C "$repoDir" -s codegen config get --path "versions.byoh")"

"$rootDir/gen/capi/crds.sh" \
    --component infrastructure \
    --module byoh \
    --version "$version"
