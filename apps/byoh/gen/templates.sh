#!/bin/bash
set -em

if ! command -v clusterctl >/dev/null 2>&1; then
    echo "Install clusterctl first https://cluster-api.sigs.k8s.io/user/quick-start#install-clusterctl"
    exit 1
fi

if ! command -v pulumi >/dev/null 2>&1; then
    echo "Install pulumi first https://www.pulumi.com/docs/install/"
    exit 1
fi

if ! command -v kubectl-slice >/dev/null 2>&1; then
    echo "Install kubectl-slice first https://github.com/patrickdappollonio/kubectl-slice#installation"
    exit 1
fi

rootDir="$(git rev-parse --show-toplevel)"
repoDir="$rootDir/apps/byoh"
manifestDir="$repoDir/templates"
version="$(pulumi -C "$repoDir" -s codegen config get --path "versions.byoh")"

[ -d "$manifestDir" ] && rm -r "$manifestDir"
mkdir -p "$manifestDir"

"$rootDir/gen/capi/provider.sh" \
    --component infrastructure \
    --module byoh \
    --version "$version" \
    | kubectl slice \
    --template '{{.kind | lower}}.yaml' \
    --output-dir "$manifestDir"
