#!/bin/bash
set -eu

exitCode=0
namespace="dashboard"

echo -e "Running Kubernetes Dashboard tests\n"

echo "Waiting for deployment to be available..."
if kubectl wait deployment dashboard-kubernetes-dashboard-web -n "$namespace" --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

# TODO: Wait/check that ingress is ready
# Might be hard ATM since the cf ingress controller doesn't update the .status.loadBalancer field

# hostname="$(kubectl get ingress -n dashboard kubernetes-dashboard -o json | jq -r '.spec.rules[0].host')"
# echo "curl -s https://$hostname"
# if curl -s "https://$hostname" 1>/dev/null; then
#     echo -e "✅ Dashboard is publicly accessible!\n"
# else
#     echo -e "❌ Dashboard is not publicly accessible!\n"
#     exitCode=1
# fi

exit $exitCode
