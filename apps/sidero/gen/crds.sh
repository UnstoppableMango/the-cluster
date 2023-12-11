#!/bin/bash
set -eum

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/sidero"
version="$(pulumi -C "$repoDir" -s codegen config get --path "versions.sidero")"

"$rootDir/gen/capi/crds.sh" \
    --component infrastructure \
    --module sidero \
    --version "$version" \
