#!/bin/bash
set -eu

exitCode=0
namespace="metallb-system"
root="$(git rev-parse --show-toplevel)/apps/metallb"

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

echo "Verifying IPAddressPool..."
name="$(pulumi -C "$root" stack output poolName)"
actual="$(kubectl get IPAddressPool "$name" -n "$namespace" -o jsonpath='{.spec.addresses[0]}')"
expected="$(pulumi -C "$root" stack output addresses)"
if [ "$actual" == "$expected" ]; then
    echo -e "✅ IPAddressPool had expected IP addresses!\n"
else
    echo "❌ IPAddressPool did not have expected IP addresses!"
    echo "Expected: $expected"
    echo -e "Actual:   $actual\n"
    exitCode=1
fi

echo "Verifying L2Advertisement..."
name="$(pulumi -C "$root" stack output advertisementName)"
actual="$(kubectl get L2Advertisement "$name" -n "$namespace" -o jsonpath='{.spec.ipAddressPools[0]}')"
expected="$(pulumi -C "$root" stack output poolName)"
if [ "$actual" == "$expected" ]; then
    echo -e "✅ L2Advertisement had expected IP pools!\n"
else
    echo "❌ L2Advertisement did not have expected IP pools!"
    echo "Expected: $expected"
    echo -e "Actual:   $actual\n"
    exitCode=1
fi

exit $exitCode
