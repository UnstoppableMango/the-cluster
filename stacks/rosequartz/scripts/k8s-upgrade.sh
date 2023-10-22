#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${RQ_STACK:-dev}"

currentVersion="$(kubectl version -o json | jq -r '.serverVersion.gitVersion | sub("^v"; "")')"
k8sVersion="$(cat "$root/.versions" | yq -r '."kubernetes/kubernetes"')"

if [ "$currentVersion" = "$k8sVersion" ]; then
    echo "Current version: $currentVersion matched upgrade version: $k8sVersion"
    exit 0
fi

dryRun=""
if [ -z ${RQ_DRY_RUN+x} ]; then
    . "$cwd/etcd-backup.sh"
else
    echo "Performing a dry run"
    dryRun="--dry-run"
fi

echo "Upgrading kubernetes..."
echo "from: $currentVersion"
echo "to:   $k8sVersion"

talosctl upgrade-k8s \
    --from "$currentVersion" \
    --to "$k8sVersion" \
    $dryRun
