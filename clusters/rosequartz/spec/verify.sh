#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
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
expectedVersion="v$(pulumi -C "$root" config get --path 'versions.k8s')"
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

echo "Waiting for kubelet-serving-cert-approver deployment to be available..."
if kubectl wait deployment kubelet-serving-cert-approver -n "kubelet-serving-cert-approver" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
fi

if ! command -v talosctl &> /dev/null; then
    echo "talosctl does not appear to be installed, skipping remaining tests"
    exit $exitCode
fi

echo "Checking cluster health..."
node="$(pulumi -C "$root" config get endpoint)"
clusterHealth="$(talosctl health --nodes "$node")"
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
expectedVersion="v$(pulumi -C "$root" config get --path 'versions.talos')"
serverVersion="$(talosctl version | tr -d ' \t' | awk -F':' '/^Tag/{print $2}' | tail -n 1)"

if [ "$expectedVersion" == "$serverVersion" ]; then
    echo "✅ Talos has expected version $expectedVersion!"
else
    echo "❌ Talos version did not match expected version!"
    echo "Expected: v$expectedVersion"
    echo "Actual:   $serverVersion"
    exitCode=1
fi

exit $exitCode
