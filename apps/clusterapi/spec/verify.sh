#!/bin/bash
set -eu

exitCode=0

echo -e "Running Cluster API tests\n"

echo "Waiting for Cluster API to be available..."
if kubectl wait deployment capi-controller-manager -n capi-system --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for Talos Bootstrap Provider to be available..."
if kubectl wait deployment cabpt-controller-manager -n cabpt-system --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for Talos Bootstrap Provider to be available..."
if kubectl wait deployment cabpt-controller-manager -n cabpt-system --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for Talos Controlplane Provider to be available..."
if kubectl wait deployment cacppt-controller-manager -n cacppt-system --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for Sidero Infrastructure Provider to be available..."
if kubectl wait deployment caps-controller-manager -n sidero-system --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for Sidero Controller Manager to be available..."
if kubectl wait deployment sidero-controller-manager -n sidero-system --for condition=Available=true --timeout=120s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

# TODO: Test patches

exit $exitCode
