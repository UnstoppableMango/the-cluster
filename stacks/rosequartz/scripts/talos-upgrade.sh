#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

# TODO: Check if the targetd cluster is a docker cluster
# The upgrade command does not appear to support the docker provisioner

talosVersion="$(awk -F= '$1 == "siderolabs/talos" {print $2}' "$root/.versions")"

# TODO: Download the version of talosctl used by the cluster, per docs recommendation
# https://www.talos.dev/v1.5/talos-guides/upgrading-talos/#faqs
# At the time of writing, the install script defaults to the latest GitHub release
# curl -sL https://talos.dev/install | INSTALLPATH="TODO" sh

. "$cwd/etcd-backup.sh"

echo "Upgrading talos to $talosVersion..."
talosctl upgrade \
    --image "ghcr.io/siderolabs/installer:v$talosVersion" \
    --preserve \
    --wait
