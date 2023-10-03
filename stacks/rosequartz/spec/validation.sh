#!/bin/bash

set -u

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${RQ_STACK:-dev}"
export TALOSCONFIG="${RQ_TALOSCONFIG:-"$root/.talos/$stack/talosconfig"}"
export KUBECONFIG="${RQ_KUBECONFIG:-"$root/.kube/$stack/config"}"
exitCode=0

echo "TALOSCONFIG should be set..."
if [ ! -z ${TALOSCONFIG+x} ]; then
    echo "✅ TALOSCONFIG is set to $TALOSCONFIG!"
else
    echo "❌ TALOSCONFIG is not set!"
    exitCode=1
fi

echo ""

echo "TALOSCONFIG should exist..."
if [ -f "$TALOSCONFIG" ]; then
    echo "✅ $TALOSCONFIG exists!"
else
    echo "❌ $TALOSCONFIG does not exist!"
    exitCode=1
fi

echo ""

echo "KUBECONFIG should be set..."
if [ ! -z ${KUBECONFIG+x} ]; then
    echo "✅ KUBECONFIG is set to $KUBECONFIG!"
else
    echo "❌ KUBECONFIG is not set!"
    exitCode=1
fi

echo ""

echo "KUBECONFIG should exist..."
if [ -f "$KUBECONFIG" ]; then
    echo "✅ $KUBECONFIG exists!"
else
    echo "❌ $KUBECONFIG does not exist!"
    exitCode=1
fi

echo ""

echo "It should be running..."
if kubectl get nodes 1>/dev/null; then
    echo "✅ Cluster is available!"
else
    echo "❌ Couldn't connect to cluster!"
    exitCode=1
fi

echo ""

echo "It should use configured kubernetes version..."
expectedVersion="v$(awk -F= '$1 == "kubernetes/kubernetes" {print $2}' "$root/.versions")"
serverVersion="$(kubectl version -o json | jq -r '.serverVersion.gitVersion')"

if [ "$expectedVersion" == "$serverVersion" ]; then
    echo "✅ Cluster has expected version $expectedVersion!"
else
    echo "❌ Cluster version did not match expected version!"
    echo "Expected: $expectedVersion"
    echo "Actual:   $serverVersion"
    exitCode=1
fi

echo ""

echo "It should allow scheduling workloads on the controlplane..."
if ! kubectl get nodes -o json | jq -e '.items[].spec.taints' 1>/dev/null; then
    echo "✅ Controlplane is schedulable!"
else
    echo "❌ Controlplane had unexpected taints!"
    kubectl get nodes -o json | jq '.items[].spec.taints'
    exitCode=1
fi

echo ""

echo "It should have configured hostname..."
hostname="$(kubectl get nodes -o json | jq -r '.items[].metadata.labels."kubernetes.io/hostname"')"

if [ "$hostname" == "rqctrl1" ]; then
    echo "✅ Node had expected hostname $hostname!"
else
    echo "❌ Node did not have expected hostname!"
    echo "Expected: rqctrl1"
    echo "Actual:   $hostname"
    exitCode=1
fi

if ! command -v talosctl &> /dev/null; then
    echo "talosctl does not appear to be installed, skipping remaining tests"
    exit $exitCode
fi

echo ""

echo "Checking cluster health..."
clusterHealth="$(talosctl health 2>&1)"
retval=$?
if [ $retval -eq 0 ]; then
    echo "✅ Cluster is healthy!"
else
    echo "❌ Cluster was not healthy!"
    echo "$clusterHealth"
    exitCode=1
fi

echo ""

echo "It should use configured talos version..."
expectedVersion="$(awk -F= '$1 == "siderolabs/talos" {print $2}' "$root/.versions")"
serverVersion="$(talosctl version | tr -d ' \t' | awk -F':' '/^Tag/{print $2}' | tail -n 1)"

if [ "v$expectedVersion" == "$serverVersion" ]; then
    echo "✅ Talos has expected version $expectedVersion!"
else
    echo "❌ Talos version did not match expected version!"
    echo "Expected: v$expectedVersion"
    echo "Actual:   $serverVersion"
    exitCode=1
fi

exit $exitCode
