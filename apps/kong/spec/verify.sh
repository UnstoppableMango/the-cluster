#!/bin/bash
set -eum

exitCode=0
namespace="kong-system"

echo -e "Running Kong tests\n"

echo "Waiting for deployment to be available..."
if kubectl -n "$namespace" wait --for=condition=Available=true --timeout=120s deployment/gateway-operator-controller-manager 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

exit $exitCode
