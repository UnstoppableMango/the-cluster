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

echo "Standing up cluster..."
. "$root/ci/up.sh"
echo ""

# Something weird is happening with the cwd variable here...
# The exported vars above have the correct cwd
# Here cwd is at $root/ci for some reason
echo "Running validation..."
. "$cwd/validation.sh"
echo ""

echo "Running etcd-backup..."
. "$cwd/etcd-backup.sh"
echo ""

echo "Tearing down cluster..."
. "$root/ci/down.sh"
echo ""
