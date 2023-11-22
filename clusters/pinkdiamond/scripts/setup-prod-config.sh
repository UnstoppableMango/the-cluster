#!/bin/bash
set -eum

if ! command -v talosctl >/dev/null 2>&1; then
    echo "Install talosctl first https://www.talos.dev/v1.5/introduction/quickstart/#talosctl"
    exit 1
fi

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
managementStack="$(pulumi -C "$root" stack --show-name)"
clusterName="$(pulumi -C "$root" config get clusterName)"

kubeDir="$root/.kube/prod"
talosDir="$root/.talos/prod"

mkdir -p "$kubeDir"
mkdir -p "$talosDir"

export KUBECONFIG="$root/.kube/$managementStack/config"
export TALOSCONFIG="$talosDir/talosconfig.yaml"

echo "Fetching talosconfig..."
kubectl get talosconfig \
    -n rosequartz \
    -l "cluster.x-k8s.io/cluster-name=$clusterName" \
    --sort-by={metadata.creationTimestamp} \
    -o yaml -o jsonpath='{.items[0].status.talosConfig}' \
    > "$TALOSCONFIG"

echo "Getting IPs..."
localIp="$(pulumi -C "$root" config -s prod get localIp)"
endpoint="$(pulumi -C "$root" config -s prod get --path 'controlPlane.endpoint')"

export KUBECONFIG="$root/.kube/prod/config"

echo "Configuring talosconfig..."
talosctl config node $localIp
talosctl config endpoint "$endpoint"
echo "Fetching kubeconfig..."
talosctl --talosconfig $TALOSCONFIG kubeconfig $KUBECONFIG
