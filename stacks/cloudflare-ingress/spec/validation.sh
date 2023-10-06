#!/bin/bash
set -u

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

namespace="cloudflare-ingress-test"

function cleanup() {
    echo "Deleting test resources"
    kubectl delete -f "$cwd/resources.yaml" --wait
}

trap cleanup EXIT

echo "Applying test resources..."
kubectl apply -f "$cwd/resources.yaml" --wait
echo ""

sleep 5

if kubectl wait deployment test-deployment -n "$namespace" --for condition=Available=true --timeout=120s; then
    echo "✅ Deployment is ready"
else
    echo "❌ Deployment was not ready in time"
fi

echo ""
