#!/bin/bash
set -eu

root="$(git rev-parse --show-toplevel)/stacks/pinkdiamond"

talosVersion="$(cat $root/.versions | yq -r '."siderolabs/talos"')"
k8sVersion="$(cat $root/.versions | yq -r '."kubernetes/kubernetes"')"
sideroVersion="$(cat $root/.versions | yq -r '."siderolabs/sidero"')"

export CONTROL_PLANE_SERVERCLASS=rpi
export WORKER_SERVERCLASS=rpi
export TALOS_VERSION="v$talosVersion"
export KUBERNETES_VERSION="v$k8sVersion"
export CONTROL_PLANE_PORT=6443
export CONTROL_PLANE_ENDPOINT=pd.thecluster.io

echo "Talos Version:      $TALOS_VERSION"
echo "Kubernetes Version: $KUBERNETES_VERSION"
echo "Sidero Version:     $sideroVersion"

echo "Generating cluster..."
clusterctl generate cluster pink-diamond \
    --infrastructure "sidero:v$sideroVersion" \
    --target-namespace "pink-diamond" \
    --control-plane-machine-count "3" \
    --worker-machine-count "2" \
    > "$root/manifests/cluster.yaml"
