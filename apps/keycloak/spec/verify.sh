#!/bin/bash
set -eum

exitCode=0
namespace="keycloak"

echo -e "Running keycloak tests\n"

echo "Waiting for statefulset to be available..."
if kubectl rollout status statefulset/keycloak -n "$namespace" 1>/dev/null; then
    echo -e "✅ Statefulset is ready!\n"
else
    echo -e "❌ Statefulset was not ready in time!\n"
    exitCode=1
fi

# TODO: Wait/check that ingress is ready
# Might be hard ATM since the cf ingress controller doesn't update the .status.loadBalancer field

hostname="$(kubectl get ingress -n "$namespace" keycloak -o json | jq -r '.spec.rules[0].host')"
echo "curl -s https://$hostname"
if curl -s "https://$hostname" 1>/dev/null; then
    echo -e "✅ Keycloak is publicly accessible!\n"
else
    echo -e "❌ Keycloak is not publicly accessible!\n"
    exitCode=1
fi

exit $exitCode
