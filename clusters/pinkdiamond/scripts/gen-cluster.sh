#!/bin/bash
set -eu

root="$(git rev-parse --show-toplevel)/clusters/pinkdiamond"

stack="$(pulumi -C "$root" stack --show-name)"
talosVersion="$(pulumi -C "$root" config get --path 'versions.talos')"
k8sVersion="$(pulumi -C "$root" config get --path 'versions.k8s')"
sideroVersion="$(pulumi -C "$root" config get --path 'versions.sidero')"
clusterName="$(pulumi -C "$root" config get clusterName)"

export CONTROL_PLANE_SERVERCLASS="rpi4.md"
export WORKER_SERVERCLASS="px.zeus.md"
export TALOS_VERSION="v$talosVersion"
export KUBERNETES_VERSION="v$k8sVersion"
export CONTROL_PLANE_PORT="6443"
export CONTROL_PLANE_ENDPOINT="192.168.1.100"

echo "Talos Version:      $TALOS_VERSION"
echo "Kubernetes Version: $KUBERNETES_VERSION"
echo "Sidero Version:     v$sideroVersion"
echo ""

mkdir -p "$root/manifests/$stack"

echo "Generating cluster..."
clusterctl generate cluster "$clusterName" \
    --infrastructure "sidero:v$sideroVersion" \
    --target-namespace "$clusterName" \
    --control-plane-machine-count "3" \
    --worker-machine-count "3" \
    > "$root/manifests/$stack/cluster.yaml"
