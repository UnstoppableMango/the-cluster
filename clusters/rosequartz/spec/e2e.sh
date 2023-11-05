#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"

# Create local docker nodes
. "$root/hack/up.sh"

# Create cluster
pulumi -C "$root" up -yf

# Setup config files
. "$root/hack/write-config-files.sh"

# Run tests
talosctl health --nodes "$(pulumi -C "$root" config get endpoint)"
bash "$root/spec/verify.sh"
. "$root/spec/etcd-backup.sh"
RQ_DRY_RUN=true bash "$root/scripts/k8s-upgrade.sh"

# Teardown infastructure
pulumi -C "$root" down -yf
. "$root/hack/down.sh"
