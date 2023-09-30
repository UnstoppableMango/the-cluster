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
    --state "$TALOS_STATE" \
    --talosconfig "$TALOSCONFIG" \
    --endpoint "https://$NODE_IP:6443" \
    --arch arm64 \
    --talos-version "v$TALOS_VERSION" \
    --kubernetes-version "$K8S_VERSION" \
    --skip-kubeconfig \
    --disk 65536 \
    --memory 4096 \
    --workers 0 \
    --wait \
    --wait-timeout "2m30s"
