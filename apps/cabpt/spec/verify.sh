#!/bin/bash
set -eu

exitCode=0

echo -e "Running Cluster API tests\n"

echo "Waiting for Talos Bootstrap Provider to be available..."
if kubectl wait deployment cabpt-controller-manager -n cabpt-system --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

# TODO: Test patches

exit $exitCode
