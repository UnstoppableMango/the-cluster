#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

nodeIp="${ROSEQUARTZ_NODE_IP:-10.5.0.2}"
talosVersion="$(< "$root/.versions/talos")"

. "$cwd/etcd-backup.sh"

# echo "Upgrading talos..."
# talosctl upgrade \
#     --nodes "$nodeIp" \
#     --image "ghcr.io/siderolabs/installer:v$talosVersion" \
#     --preserve \
#     --wait
