#!/bin/bash
set -eu

exitCode=0
namespace="metallb-system"

echo -e "Running metallb tests\n"

echo "Waiting for deployment to be available..."
if kubectl wait deployment metallb-controller -n "$namespace" --for condition=Available=true --timeout=60s 1>/dev/null; then
    echo -e "✅ Deployment is ready!\n"
else
    echo -e "❌ Deployment was not ready in time!\n"
    exitCode=1
fi

echo "Waiting for metallb-speaker daemonset to be available..."
if kubectl rollout status daemonset metallb-speaker -n "$namespace" --timeout=60s 1>/dev/null; then
    echo -e "✅ metallb-speaker daemonset is ready!\n"
else
    echo -e "❌ metallb-speaker daemonset was not ready in time!\n"
    exitCode=1
fi

echo "Verifying sidero IPs..."
actual="$(kubectl get IPAddressPool sidero -n "$namespace" -o jsonpath='{.spec.addresses[0]}')"
expected='192.168.1.98/32'
if [ "$actual" == "$expected" ]; then
    echo -e "✅ Sidero IPAddressPool had expected IP addresses!\n"
else
    echo "❌ Sidero IPAddressPool did not have expected IP addresses!"
    echo "Expected: $expected"
    echo -e "Actual:   $actual\n"
    exitCode=1
fi

echo "Verifying sidero L2 advertisement..."
actual="$(kubectl get L2Advertisement sidero -n "$namespace" -o jsonpath='{.spec.ipAddressPools[0]}')"
expected='sidero'
if [ "$actual" == "$expected" ]; then
    echo -e "✅ Sidero L2Advertisement had expected IP pools!\n"
else
    echo "❌ Sidero L2Advertisement did not have expected IP pools!"
    echo "Expected: $expected"
    echo -e "Actual:   $actual\n"
    exitCode=1
fi

exit $exitCode
