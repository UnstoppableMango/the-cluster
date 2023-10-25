#!/bin/bash
set -u

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

namespace="cloudflare-ingress-test"
exitCode=0

function cleanup() {
    echo "Deleting test resources"
    kubectl delete -f "$cwd/resources.yaml" --wait
}

trap cleanup EXIT

echo "Applying test resources..."
kubectl apply -f "$cwd/resources.yaml" --wait
echo ""

echo "Waiting for deployment to be available..."
if kubectl wait deployment test-deployment -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo "✅ Deployment is ready"
else
    echo "❌ Deployment was not ready in time"
    exitCode=1
fi

echo ""

echo "It should route traffic properly"
if curl -s https://cf-ing-test.thecluster.io 1>/dev/null; then
    echo "✅ Ingress is properly routing traffic!"
else
    echo "❌ Ingress is not routing traffic!"

    name="$(kubectl get pods -n cloudflare-ingress -o json | jq -r '.items[].metadata.name' | grep ingress)"
    kubectl logs -n cloudflare-ingress "$name"
    exitCode=1
fi

echo ""

exit $exitCode
