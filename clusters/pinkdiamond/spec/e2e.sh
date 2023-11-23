#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/pinkdiamond"

echo "Creating local docker nodes..."
. "$root/hack/up.sh"

echo "Deploying cluster..."
pulumi -C "$root" up -yf

echo "Setting up config files..."
. "$root/hack/write-config-files.sh"
source "$root/hack/source-me.sh"

echo "Running tests..."
talosctl health --nodes "$(pulumi -C "$root" config get --path 'nodeData.controlplanes' | jq -r 'keys | .[0]')"
bash "$root/spec/verify.sh"
. "$root/spec/etcd-backup.sh"
PD_DRY_RUN=true bash "$root/scripts/k8s-upgrade.sh"

echo "Tearing down infrastructure..."
pulumi -C "$root" down -yf
. "$root/hack/down.sh"
