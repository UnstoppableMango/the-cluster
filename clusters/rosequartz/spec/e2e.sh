#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"

function teardown() {
    pulumi -C "$root" stack output
    echo "Tearing down infrastructure..."
    # shellcheck source=../hack/down.sh
    . "$root/hack/down.sh"
}

trap teardown EXIT

echo "Creating local docker nodes..."
# shellcheck source=../hack/up.sh
. "$root/hack/up.sh"

echo "Deploying cluster..."
pulumi -C "$root" up -yf

echo "Setting up config files..."
# shellcheck source=../hack/write-config-files.sh
. "$root/hack/write-config-files.sh"
# shellcheck source=../hack/source-me.sh
source "$root/hack/source-me.sh"

echo "Running tests..."
talosctl health --nodes "$(pulumi -C "$root" config get --path 'controlplanes' | jq -r '.[0].ip')"
bash "$root/spec/verify.sh"
# shellcheck source=../spec/etcd-backup.sh
. "$root/spec/etcd-backup.sh"
RQ_DRY_RUN=true bash "$root/scripts/k8s-upgrade.sh"
