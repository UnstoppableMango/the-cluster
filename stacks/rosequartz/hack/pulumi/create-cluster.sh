#!/bin/bash

set -eu

# source "$(dirname "$0")/talos-vars.sh"

STACK="${RQ_STACK:-dev}"
CLUSTER_NAME="$(pulumi config get clusterName -s "$STACK")"
NODE_IP="$(pulumi config get nodeIp -s "$STACK")"
K8S_VERSION="$(pulumi config get --path 'versions.k8s' -s "$STACK")"
TALOS_VERSION="$(pulumi config get --path 'versions.talos' -s "$STACK")"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
STACK_DIR=$(dirname "$SCRIPT_DIR")
TALOS_DIR="${RQ_TALOS_DIR:-"$STACK_DIR/.talos/$STACK"}"
KUBE_DIR="${RQ_TALOS_DIR:-"$STACK_DIR/.kube/$STACK"}"
TALOS_STATE="${RQ_TALOS_STATE:-$TALOS_DIR/clusters}"

TALOSCONFIG="${RQ_TALOSCONFIG:-$TALOS_DIR/config}"
KUBECONFIG="${RQ_KUBECONFIG:-$KUBE_DIR/config}"

# talosctl cluster create \
#     --name "$CLUSTER_NAME" \
#     --provisioner docker \
#     --state "$TALOS_STATE" \
#     --talosconfig "$TALOSCONFIG" \
#     --input-dir "$TALOS_DIR" \
#     --endpoint "https://$NODE_IP:6443" \
#     --arch arm64 \
#     --talos-version "v$TALOS_VERSION" \
#     --kubernetes-version "$K8S_VERSION" \
#     --skip-injecting-config \
#     --skip-kubeconfig \
#     --disk 65536 \
#     --memory 4096 \
#     --workers 0 \
#     --wait

talosctl cluster create \
    --name "$CLUSTER_NAME" \
    --provisioner docker \
    --state "$TALOS_STATE" \
    --talosconfig "$TALOSCONFIG" \
    --input-dir "$TALOS_DIR" \
    --arch arm64 \
    --kubernetes-version "$K8S_VERSION" \
    --skip-injecting-config \
    --skip-kubeconfig \
    --memory 4096 \
    --workers 0 \
    --wait
