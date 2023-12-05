#!/bin/bash
set -eum

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/cacppt"
cacpptVersion="$(pulumi -C "$repoDir" -s codegen config get --path "versions.cacppt")"

"$rootDir/gen/capi/crds.sh" \
    --component control-plane \
    --module talos \
    --version "$cacpptVersion" \
