#!/bin/bash

set -eu

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
source "$root/common.sh"

mkdir -p "$TALOS_DIR"

trap popd EXIT
pushd "$TALOS_DIR"

talosctl cluster create \
    --name "$CLUSTER_NAME" \
    --provisioner "$PROVISIONER" \
    --talosconfig "$TALOSCONFIG" \
    --talos-version "v$TALOS_VERSION" \
    --kubernetes-version "$K8S_VERSION" \
    --disk 65536 \
    --memory 4096 \
    --controlplanes 3 \
    --workers 0
