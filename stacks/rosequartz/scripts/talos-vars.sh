#!/bin/bash

set -eu

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

TALOS_DIR="${ROSEQUARTZ_TALOS_DIR:-"$(dirname "$SCRIPT_DIR")/.talos"}"
KUBE_DIR="${ROSEQUARTZ_KUBE_DIR:-"$(dirname "$SCRIPT_DIR")/.kube"}"

TALOSCONFIG="${ROSEQUARTZ_TALOSCONFIG:-$TALOS_DIR/config}"
TALOS_STATE="${ROSEQUARTZ_STATE:-$TALOS_DIR/clusters}"
CLUSTER_NAME="${ROSEQUARTZ_CLUSTER_NAME:-talos-rosequartz}"

export KUBECONFIG="$KUBE_DIR/config"
