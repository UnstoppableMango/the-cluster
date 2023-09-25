#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

# TODO: Check if the targetd cluster is a docker cluster
# The upgrade command does not appear to support the docker provisioner

nodeIp="${ROSEQUARTZ_NODE_IP:-"10.5.0.2"}"
talosVersion="$(< "$root/.versions/talos")"

# TODO: Download the version of talosctl used by the cluster, per docs recommendation
# https://www.talos.dev/v1.5/talos-guides/upgrading-talos/#faqs
# At the time of writing, the install script defaults to the latest GitHub release
# curl -sL https://talos.dev/install | INSTALLPATH="TODO" sh

. "$cwd/etcd-backup.sh"

echo "Upgrading talos..."
talosctl upgrade \
    --nodes "$nodeIp" \
    --image "ghcr.io/siderolabs/installer:v$talosVersion" \
    --preserve \
    --wait
