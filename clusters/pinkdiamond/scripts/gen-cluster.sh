#!/bin/bash
set -eu

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"

stack="$(pulumi -C "$root" stack --show-name)"
talosVersion="$(pulumi -C "$root" config get --path 'versions.talos')"
k8sVersion="$(pulumi -C "$root" config get --path 'versions.k8s')"
sideroVersion="$(pulumi -C "$root" config get --path 'versions.sidero')"
clusterName="$(pulumi -C "$root" config get clusterName)"

export CONTROL_PLANE_SERVERCLASS="$(pulumi -C "$root" config get --path 'serverClass.controlPlane')"
export WORKER_SERVERCLASS="$(pulumi -C "$root" config get --path 'serverClass.worker')"
export TALOS_VERSION="v$talosVersion"
export KUBERNETES_VERSION="v$k8sVersion"
export CONTROL_PLANE_PORT="$(pulumi -C "$root" config get --path 'controlPlane.port')"
export CONTROL_PLANE_ENDPOINT="$(pulumi -C "$root" config get --path 'controlPlane.endpoint')"

echo "Talos Version:      $TALOS_VERSION"
echo "Kubernetes Version: $KUBERNETES_VERSION"
echo "Sidero Version:     v$sideroVersion"
echo ""

mkdir -p "$root/manifests/$stack"

echo "Generating cluster..."
clusterctl generate cluster "$clusterName" \
    --infrastructure "sidero:v$sideroVersion" \
    --target-namespace "$clusterName" \
    --control-plane-machine-count "$(pulumi -C "$root" config get --path 'controlPlane.machineCount')" \
    --worker-machine-count "$(pulumi -C "$root" config get --path 'worker.machineCount')" \
    > "$root/manifests/$stack/cluster.yaml"
