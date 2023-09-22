#!/bin/bash

set -eu

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
STACK_DIR=$(dirname "$SCRIPT_DIR")

STACK="${ROSEQUARTZ_STACK:-dev}"

TALOS_DIR="${ROSEQUARTZ_TALOS_DIR:-"$STACK_DIR/.talos/$STACK"}"
KUBE_DIR="${ROSEQUARTZ_KUBE_DIR:-"$STACK_DIR/.kube/$STACK"}"

# function version () {
#     echo "$(yq -r ".config.versions.value.$1" "$STACK_DIR/Pulumi.yaml")"
# }

# K8S_VERSION=$(version 'k8s')
# TALOS_VERSION=$(version 'talos')

TALOSCONFIG="${ROSEQUARTZ_TALOSCONFIG:-$TALOS_DIR/config}"
TALOS_STATE="${ROSEQUARTZ_STATE:-$TALOS_DIR/clusters}"

CLUSTER_NAME="${ROSEQUARTZ_CLUSTER_NAME:-talos-rosequartz}"
NODE_IP="${ROSEQUARTZ_NODE_IP:-10.5.0.2}"
ENDPOINT="${ROSEQUARTZ_ENDPOINT:-https://"$NODE_IP":6443}"

export KUBECONFIG="$KUBE_DIR/config"
