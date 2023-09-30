#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${ROSEQUARTZ_STACK:-dev}"
kubeDir="${ROSEQUARTZ_KUBE_DIR:-"$root/.kube/$stack"}"
export KUBECONFIG="${ROSEQUARTZ_KUBECONFIG:-"$kubeDir/config"}"

nodeIp="${ROSEQUARTZ_NODE_IP:-"10.5.0.2"}"
currentVersion="$(kubectl version -o json | jq -r '.serverVersion.gitVersion | sub("^v"; "")')"
k8sVersion="$(< "$root/.versions/k8s")"

if [ "$currentVersion" = "$k8sVersion" ]; then
    echo "Current version: $currentVersion matched upgrade version: $k8sVersion"
    exit 0
fi

dryRun=""
if [ -z ${ROSEQUARTZ_DRY_RUN+x} ]; then
    . "$cwd/etcd-backup.sh"
else
    echo "Performing a dry run"
    dryRun="--dry-run"
fi

echo "Upgrading kubernetes..."
echo "from: $currentVersion"
echo "to:   $k8sVersion"

talosctl upgrade-k8s \
    --nodes "$nodeIp" \
    --from "$currentVersion" \
    --to "$k8sVersion" \
    $dryRun
