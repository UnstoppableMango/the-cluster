#!/bin/bash

set -eu

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${ROSEQUARTZ_STACK:-dev}"
TALOSCONFIG="${ROSEQUARTZ_TALOSCONFIG:-"$root/.talos/$stack/talosconfig"}"
KUBECONFIG="${ROSEQUARTZ_KUBECONFIG:-"$root/.kube/$stack/config"}"

echo "It should be running..."
if kubectl get nodes 1>/dev/null; then
    echo "✅ Cluster is available!"
else
    echo "❌ Couldn't connect to cluster!"
    exit 1
fi

echo "It should use configured kubernetes version..."
expectedVersion="$(cat "$root/.versions/k8s")"
serverVersion="$(kubectl version -o json | jq -r '.serverVersion.gitVersion')"

if [ "v$expectedVersion" == "$serverVersion" ]; then
    echo "✅ Cluster has expected version $expectedVersion!"
else
    echo "❌ Cluster version did not match expected version!"
    echo "Expected: $expectedVersion"
    echo "Actual:   $serverVersion"
fi

echo "It should allow scheduling workloads on the controlplane..."
if ! kubectl get nodes -o json | jq -e '.items[].spec.taints' 1>/dev/null; then
    echo "✅ Controlplane is schedulable!"
else
    echo "❌ Controlplane had unexpected taints!"
    kubectl get nodes -o json | jq '.items[].spec.taints'
fi

echo "It should have configured hostname..."
hostname="$(kubectl get nodes -o json | jq -r '.items[].metadata.labels."kubernetes.io/hostname"')"

if [ "$hostname" == "rqctrl1" ]; then
    echo "✅ Node had expected hostname $hostname!"
else
    echo "❌ Node did not have expected hostname!"
    echo "Expected: rqctrl1"
    echo "Actual:   $hostname"
fi

if ! command -v talosctl &> /dev/null; then
    echo "talosctl does not appear to be installed, skipping remaining tests"
    exit 0
fi

nodeIp="${ROSEQUARTZ_NODE_IP:-10.5.0.2}"

echo "Checking cluster health..."
talosctl health --nodes "$nodeIp"
