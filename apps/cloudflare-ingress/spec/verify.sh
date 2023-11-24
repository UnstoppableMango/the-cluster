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

echo -e "Generating test resources...\n"
export SUBDOMAIN=$RANDOM
INGRESS_CLASS_NAME="$(pulumi -C "$cwd" stack output ingressClass)"
export INGRESS_CLASS_NAME
envsubst < "$cwd/resources.template.yaml" > "$cwd/resources.yaml"

echo "Verifying test resource generation..."
host="$(yq -r 'select(.kind == "Ingress") | .spec.rules[].host' "$cwd/resources.yaml")"
if [ "$SUBDOMAIN.thecluster.io" == "$host" ]; then
    echo -e "✅ Resources were properly templated\n"
else
    echo -e "❌ Resources were not properly templated\n"

    cat "$cwd/resources.yaml"
    exitCode=1
fi

echo "Applying test resources..."
kubectl apply --wait -f "$cwd/resources.yaml"
echo ""

echo "Waiting for deployment to be available..."
if kubectl wait deployment test-deployment -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready\n"
else
    echo -e "❌ Deployment was not ready in time\n"
    exitCode=1
fi

duration=15
echo "Sleeping for $duration"s...
sleep $duration

echo "It should route traffic properly"
if curl -s https://$SUBDOMAIN.thecluster.io 1>/dev/null; then
    echo -e "✅ Ingress is properly routing traffic!\n"
else
    echo -e "❌ Ingress is not routing traffic!\n"

    name="$(kubectl get pods -n cloudflare-ingress -o json | jq -r '.items[].metadata.name' | grep ingress)"
    kubectl logs -n cloudflare-ingress "$name"
    exitCode=1
fi

exit $exitCode
