#!/bin/bash
set -eum

exitCode=0
namespace="oauth2-proxy"

echo -e "Running oauth2-proxy tests\n"

echo "Waiting for deployment to be available..."
if kubectl wait deployment github-oauth2-proxy -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

# TODO: Wait/check that ingress is ready
# Might be hard ATM since the cf ingress controller doesn't update the .status.loadBalancer field

hostname="$(kubectl get ingress -n "$namespace" github-oauth2-proxy -o json | jq -r '.spec.rules[0].host')"
echo "curl -s https://$hostname/ping"
if curl -s "https://$hostname/ping" 1>/dev/null; then
    echo -e "✅ Proxy is publicly accessible!\n"
else
    echo -e "❌ Proxy is not publicly accessible!\n"
    exitCode=1
fi

exit $exitCode
