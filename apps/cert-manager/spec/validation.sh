#!/bin/bash
set -eu

exitCode=0
namespace="cert-manager"

echo -e "Running cert-manager tests\n"

echo "Waiting for deployment to be available..."
if kubectl wait deployment cert-manager -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for cainjector deployment to be available..."
if kubectl wait deployment cert-manager-cainjector -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ cainjector deployment is ready!\n"
else
    echo -e "❌ cainjector deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for webhook deployment to be available..."
if kubectl wait deployment cert-manager-webhook -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ webhook deployment is ready!\n"
else
    echo -e "❌ webhook deployment was not ready in time!\n"
    exitCode=1
fi

exit $exitCode
