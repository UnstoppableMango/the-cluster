#!/bin/bash
set -eum

phase="Released"

# if ! command -v "$kubectl" >/dev/null; then
#     [ "$INSTALL_TOOLS" = "true" ] || return 1
#     sudo apt-get update && sudo apt-get install -y --no-install-recommends curl wget
#     version="$(curl -L -s https://dl.k8s.io/release/stable.txt)"
#     echo "Attempting to install kubectl verion: $version"
#     sudo curl -LO "https://dl.k8s.io/release/$version/bin/linux/amd64/kubectl"
#     sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
# fi

# if ! command -v "$yq" >/dev/null; then
#     [ "$INSTALL_TOOLS" = "true" ] || return 1
#     sudo apt-get update && sudo apt-get install -y --no-install-recommends curl wget
#     version="latest"
#     echo "Attempting to install yq verion: $version"
#     sudo wget https://github.com/mikefarah/yq/releases/$version/download/yq_linux_amd64 -O /usr/bin/yq
#     sudo chmod +x /usr/bin/yq
# fi

kubectl="kubectl"
yq="yq"

# TODO: Need to permission the runner to list and patch before I should even worry about finding binaries
if [ -n "${ACTIONS_RUNNER_REQUIRE_JOB_CONTAINER:-}" ]; then
    echo "Looks like we're in a runner, this script isn't ready yet!" && exit 0
    kubectl="/home/runner/_work/_tool/kubectl/1.28.0/x64"
    yq="/home/runner/_work/_tool/yq/" # TODO
fi

function remove_claim_ref() {
    pv="$1"
    echo "Attempting to remove claim ref for:"
    echo "  name:  $pv"
    echo "  phase: $phase"
    "$kubectl" patch pv "$pv" --type json -p '[{"op": "remove", "path": "/spec/claimRef"}]' || {
        "$kubectl" get pv "$pv"
        return 0
    }
}

echo "---------------------------------"
echo "Info:"
echo "GitHub Runner: ${GITHUB_RUNNER_NAME:-}"
echo "---------------------------------"
echo "Getting PVs for phase: $phase"
"$kubectl" get pv --selector 'thecluster.io/role=actions-runner' --output yaml \
    | "$yq" -r ".items[] | select(.status.phase == \"$phase\") | .metadata.name" \
    | while read -r pv; do remove_claim_ref "$pv"; done;
