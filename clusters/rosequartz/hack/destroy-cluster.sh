#!/bin/bash

set -eu

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
source "$root/common.sh"

talosctl cluster destroy \
    --name "$CLUSTER_NAME" \
    --provisioner "$PROVISIONER" \
    --state "$TALOS_STATE" \
    --talosconfig "$TALOSCONFIG"

rm \
    "$TALOS_DIR/talosconfig" \
    "$KUBE_DIR/config" \
    "$TALOS_DIR/controlplane.yaml" \
    "$TALOS_DIR/worker.yaml" \
    || true
