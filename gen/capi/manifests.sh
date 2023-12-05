#!/bin/bash
set -em

# Need to get outputDir from caller. Could just take it as an argument, but then I have to figure out how to shift off just that one options and pass the rest down to the other scripts.
echo "This script is WIP!"
exit 1

if ! command -v kubectl-slice >/dev/null 2>&1; then
    echo "Install kubectl-slice first https://github.com/patrickdappollonio/kubectl-slice#installation"
    exit 1
fi

root="$(git rev-parse --show-toplevel)"
[ ! -d "$outputDir" ] && mkdir -p "$outputDir"

"$root/gen/capi/provider.sh" "$@" \
    | kubectl slice \
    --exclude-kind CustomResourceDefinition \
    --template '{{.kind | lower}}.yaml' \
    --output-dir "$outputDir"
