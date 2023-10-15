#!/bin/bash
set -eu

namespace="dashboard"

echo -e "Running Kubernetes Dashboard tests\n"

echo "Waiting for deployment to be available..."
if kubectl wait deployment dashboard-kubernetes-dashboard -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
fi

echo "curl -s 'https://dashboard.thecluster.io'"
if curl -s 'https://dashboard.thecluster.io' 1>/dev/null; then
    echo -e "✅ Dashboard is publicly accessible!\n"
else
    echo -e "❌ Dashboard is not publicly accessible!\n"
fi
