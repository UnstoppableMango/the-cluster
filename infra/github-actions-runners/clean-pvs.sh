#!/bin/bash
set -eum

phase="Released"

function remove_claim_ref() {
    pv="$1"
    echo "Attempting to remove claim ref for:"
    echo "  name:  $pv"
    echo "  phase: $phase"
    kubectl patch pv "$pv" --type json -p '[{"op": "remove", "path": "/spec/claimRef"}]' || {
        kubectl get pv "$pv"
        return 0
    }
}

echo "---------------------------------"
echo "Info:"
echo "GitHub Runner: ${GITHUB_RUNNER:-}"
echo "---------------------------------"
echo "Getting PVs for phase: $phase"
kubectl get pv --selector 'thecluster.io/role=actions-runner' --output yaml \
    | yq -r ".items[] | select(.status.phase == \"$phase\") | .metadata.name" \
    | while read -r pv; do remove_claim_ref "$pv"; done;
