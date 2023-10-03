#!/bin/bash

set -eu

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
STACK_DIR=$(dirname "$SCRIPT_DIR")

STACK="${RQ_STACK:-dev}"

TALOS_DIR="${RQ_TALOS_DIR:-"$STACK_DIR/.talos/$STACK"}"
KUBE_DIR="${RQ_KUBE_DIR:-"$STACK_DIR/.kube/$STACK"}"

# function version () {
#     echo "$(yq -r ".config.versions.value.$1" "$STACK_DIR/Pulumi.yaml")"
# }

# K8S_VERSION=$(version 'k8s')
# TALOS_VERSION=$(version 'talos')

TALOSCONFIG="${RQ_TALOSCONFIG:-$TALOS_DIR/config}"
TALOS_STATE="${RQ_STATE:-$TALOS_DIR/clusters}"

CLUSTER_NAME="${RQ_CLUSTER_NAME:-talos-rosequartz}"
NODE_IP="${RQ_NODE_IP:-10.5.0.2}"
ENDPOINT="${RQ_ENDPOINT:-https://"$NODE_IP":6443}"

export KUBECONFIG="$KUBE_DIR/config"
