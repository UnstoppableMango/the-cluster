#!/bin/bash

set -eu

echo "This script is WIP!"
exit 1

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

source "$root/scripts/common.sh"

export ROSEQUARTZ_NODE_IP="10.5.0.2"
export ROSEQUARTZ_TALOSCONFIG="$cwd/tmp/talosconfig"
export ROSEQUARTZ_KUBECONFIG="$cwd/tmp/kubeconfig"
export ROSEQUARTZ_BACKUP_DIR="$cwd/tmp"

# NOTE: Because of bash weirdness, $cwd is not reliable after this point
# TODO: And apparently others like $KUBECONFIG

echo "Standing up cluster..."
. "$root/ci/up.sh"
echo ""

echo "Running validation..."
. "$root/spec/validation.sh"
echo ""

echo "Running etcd-backup..."
. "$root/spec/etcd-backup.sh"
echo ""

echo "Running kubernetes upgrade..."
ROSEQUARTZ_DRY_RUN=true . "$root/scripts/k8s-upgrade.sh"
. "$root/spec/validation.sh"
echo ""

echo "Tearing down cluster..."
. "$root/ci/down.sh"
echo ""
