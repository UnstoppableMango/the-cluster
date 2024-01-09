#!/bin/bash
set -e

root="$(git rev-parse --show-toplevel)/clusters/pinkdiamond"
cwd="$root/scripts"

currentVersion="$(kubectl version -o json | jq -r '.serverVersion.gitVersion | sub("^v"; "")')"
k8sVersion="$(pulumi -C "$root" config get --path 'versions.k8s')"

if [ "$currentVersion" = "$k8sVersion" ]; then
    echo "Current version: $currentVersion matched upgrade version: $k8sVersion"
    exit 0
fi

dryRun=""
if [ -z ${PD_DRY_RUN+x} ]; then
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
