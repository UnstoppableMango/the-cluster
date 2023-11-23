#!/bin/bash
set -eu

exitCode=0
namespace="metrics-server"

echo -e "Running metrics-server tests\n"

echo "Waiting for deployment to be available..."
if kubectl wait deployment metrics-server -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "kubectl top node"
if kubectl top nodes; then
    echo -e "✅ kubectl top node works!\n"
else
    echo -e "❌ kubectl top node does not work!\n"
    exitCode=1
fi

exit $exitCode
