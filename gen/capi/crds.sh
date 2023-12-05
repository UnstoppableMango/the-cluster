#!/bin/bash
set -eum

if ! command -v kubectl-slice >/dev/null 2>&1; then
    echo "Install kubectl-slice first https://github.com/patrickdappollonio/kubectl-slice#installation"
    exit 1
fi

root="$(git rev-parse --show-toplevel)"
manifestDir="$root/infra/crds/manifests"
[ ! -d "$manifestDir" ] && mkdir -p "$manifestDir"

"$root/gen/capi/provider.sh" "$@" \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$manifestDir"
