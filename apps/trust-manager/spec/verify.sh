#!/bin/bash
set -eu

exitCode=0
namespace="trust-manager"

echo -e "Running trust-manager tests\n"

echo "Waiting for deployment to be available..."
if kubectl wait deployment trust-manager -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

exit $exitCode
