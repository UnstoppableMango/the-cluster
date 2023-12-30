#!/bin/bash
set -eum

phase="Released"

if ! command -v kubectl >/dev/null; then
    [ "$INSTALL_TOOLS" = "true" ] || return 1
    sudo apt-get update && sudo apt-get install -y --no-install-recommends curl wget
    version="$(curl -L -s https://dl.k8s.io/release/stable.txt)"
    echo "Attempting to install kubectl verion: $version"
    sudo curl -LO "https://dl.k8s.io/release/$version/bin/linux/amd64/kubectl"
fi

if ! command -v yq >/dev/null; then
    [ "$INSTALL_TOOLS" = "true" ] || return 1
    sudo apt-get update && sudo apt-get install -y --no-install-recommends curl wget
    version="latest"
    echo "Attempting to install yq verion: $version"
    [ "$INSTALL_TOOLS" = "true" ] \
        && sudo wget https://github.com/mikefarah/yq/releases/$version/download/yq_linux_amd64 -O /usr/bin/yq \
        && sudo chmod +x /usr/bin/yq
fi

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
echo "GitHub Runner: ${GITHUB_RUNNER_NAME:-}"
echo "---------------------------------"
echo "Getting PVs for phase: $phase"
kubectl get pv --selector 'thecluster.io/role=actions-runner' --output yaml \
    | yq -r ".items[] | select(.status.phase == \"$phase\") | .metadata.name" \
    | while read -r pv; do remove_claim_ref "$pv"; done;
