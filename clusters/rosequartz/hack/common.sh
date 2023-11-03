#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

function version {
    pulumi config get --path "versions.$1"
}

STACK="$(hostname)"
CLUSTER_NAME="${RQ_CLUSTER_NAME:-rosequartz}"
K8S_VERSION="${RQ_K8S_VERSION:-"$(version "k8s")"}"
TALOS_VERSION="${RQ_TALOS_VERSION:-"$(version "talos")"}"

STACK_DIR=$(dirname "$SCRIPT_DIR")
TALOS_DIR="${RQ_TALOS_DIR:-"$STACK_DIR/.talos/$STACK"}"
KUBE_DIR="${RQ_KUBE_DIR:-"$STACK_DIR/.kube/$STACK"}"

TALOSCONFIG="${RQ_TALOSCONFIG:-$TALOS_DIR/talosconfig}"
KUBECONFIG="${RQ_KUBECONFIG:-$KUBE_DIR/config}"

PROVISIONER=docker
