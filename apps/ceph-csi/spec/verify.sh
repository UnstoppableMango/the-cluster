#!/bin/bash
set -eum

echo "Running Ceph CSI tests"

root="$(git rev-parse --show-toplevel)/apps/ceph-csi"
exitCode=0

function cleanup() {
    kubectl delete -f "$root/spec/resources/rbd-pvc.yaml"
    kubectl delete -f "$root/spec/resources/cephfs-pvc.yaml"
}

trap cleanup EXIT

echo "Applying test RBD PVC..."
kubectl apply --wait -f "$root/spec/resources/rbd-pvc.yaml"
echo "" # Newline

echo "Waiting for PVC to be bound..."
if kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/rbd-rwo-pvc; then
    echo -e "✅ PVC is ready!\n"
else
    echo -e "❌ PVC was not ready in time!\n"
    exitCode=1
fi

echo "Applying test cephfs PVC..."
kubectl apply --wait -f "$root/spec/resources/cephfs-pvc.yaml"
echo "" # Newline

echo "Waiting for PVC to be bound..."
if kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/csi-cephfs-pvc; then
    echo -e "✅ PVC is ready\n"
else
    echo -e "❌ PVC was not ready in time\n"
    exitCode=1
fi

exit $exitCode
