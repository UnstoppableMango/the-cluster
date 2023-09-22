#!/bin/bash

set -eu

# source "$(dirname "$0")/talos-vars.sh"

STACK="${ROSEQUARTZ_STACK:-dev}"
CLUSTER_NAME="$(pulumi config get clusterName -s "$STACK")"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
STACK_DIR=$(dirname "$SCRIPT_DIR")
TALOS_DIR="${ROSEQUARTZ_TALOS_DIR:-"$STACK_DIR/.talos/$STACK"}"
TALOSCONFIG="${ROSEQUARTZ_TALOSCONFIG:-$TALOS_DIR/config}"
TALOS_STATE="${ROSEQUARTZ_STATE:-$TALOS_DIR/clusters}"

talosctl cluster destroy \
    --name "$CLUSTER_NAME" \
    --provisioner docker \
    --state "$TALOS_STATE" \
    --talosconfig "$TALOSCONFIG"

# rm "$TALOS_DIR/config" "$KUBE_DIR/config"
# rm "$TALOS_DIR/config"
