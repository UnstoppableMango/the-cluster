#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
manifestDir="$root/infra/crds/manifests"
[ ! -d "$manifestDir" ] && mkdir -p "$manifestDir"

"$root/gen/capi/provider.sh" "$@" \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$manifestDir"
