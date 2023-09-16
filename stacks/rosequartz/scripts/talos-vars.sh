#!/bin/bash

set -eu

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

TALOS_DIR="$(dirname "$SCRIPT_DIR")/.talos"
KUBE_DIR="$(dirname "$SCRIPT_DIR")/.kube"

TALOSCONFIG="$TALOS_DIR/config"
TALOS_STATE="$TALOS_DIR/clusters"
CLUSTER_NAME="${ROSEQUARTZ_CLUSTER_NAME:-talos-rosequartz}"

export KUBECONFIG="$KUBE_DIR/config"
