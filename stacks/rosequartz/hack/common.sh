#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

function version {
    cat "$SCRIPT_DIR/../.versions/$1"
}

STACK="${RQ_STACK:-dev}"
CLUSTER_NAME="${RQ_CLUSTER_NAME:-rosequartz}"
NODE_IP="${RQ_NODE_IP:-10.5.0.2}"
K8S_VERSION="${RQ_K8S_VERSION:-"$(version "k8s")"}"
TALOS_VERSION="${RQ_TALOS_VERSION:-"$(version "talos")"}"

STACK_DIR=$(dirname "$SCRIPT_DIR")
TALOS_DIR="${RQ_TALOS_DIR:-"$STACK_DIR/.talos/$STACK"}"
KUBE_DIR="${RQ_KUBE_DIR:-"$STACK_DIR/.kube/$STACK"}"

TALOS_STATE="${RQ_TALOS_STATE:-$TALOS_DIR/clusters}"

TALOSCONFIG="${RQ_TALOSCONFIG:-$TALOS_DIR/talosconfig}"
KUBECONFIG="${RQ_KUBECONFIG:-$KUBE_DIR/config}"

PROVISIONER=docker
