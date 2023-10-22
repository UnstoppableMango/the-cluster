#!/bin/bash

set -e

if ! command -v kubectl-slice >/dev/null 2>&1; then
    echo "Install kubectl-slice first https://github.com/patrickdappollonio/kubectl-slice#installation"
    exit 1
fi

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

providerDir="$root/providers"
mkdir -p "$providerDir"

capiVersion="$(cat "$root/.versions" | yq -r '."kubernetes-sigs/cluster-api"')"
metal3Version="$(cat "$root/.versions" | yq -r '."metal3-io/cluster-api-provider-metal3"')"
cabptVersion="$(cat "$root/.versions" | yq -r '."siderolabs/cluster-api-bootstrap-provider-talos"')"
cacpptVersion="$(cat "$root/.versions" | yq -r '."siderolabs/cluster-api-control-plane-provider-talos"')"
sideroVersion="$(cat "$root/.versions" | yq -r '."siderolabs/sidero"')"
proxmoxVersion="$(cat "$root/.versions" | yq -r '."sp-yduck/cluster-api-provider-proxmox"')"

export CLUSTER_TOPOLOGY=true

function generate() {
    component=$1
    module=$2
    version=$3
    name=$4
    config=$5

    echo "Generating $name v$version"
    clusterctl generate provider $component "$module:v$version" $config > "$providerDir/$name.yaml"
    mkdir -p "$providerDir/$name"
    if [ -d "$providerDir/$name" ]; then rm -Rf "$providerDir/$name"; fi
    kubectl-slice --input-file "$providerDir/$name.yaml" --output-dir "$providerDir/$name" --include-kind CustomResourceDefinition --template "crds.yaml"
    kubectl-slice --input-file "$providerDir/$name.yaml" --output-dir "$providerDir/$name" --exclude-kind CustomResourceDefinition --template "resources.yaml"
    rm "$providerDir/$name.yaml"
}

export SIDERO_CONTROLLER_MANAGER_HOST_NETWORK=true
export SIDERO_CONTROLLER_MANAGER_DEPLOYMENT_STRATEGY=Recreate
export SIDERO_CONTROLLER_MANAGER_API_ENDPOINT="${RQ_ENDPOINT:-"10.5.0.2"}"
export SIDERO_CONTROLLER_MANAGER_AUTO_BMC_SETUP=false

generate --core "cluster-api" $capiVersion "core"
# generate --bootstrap "kubeadm" $capiVersion "kubeadm-bootstrap"
generate --bootstrap "talos" $cabptVersion "talos-bootstrap"
generate --control-plane "talos" $cacpptVersion "talos-controlplane"
# generate --control-plane "kubeadm" $capiVersion "kubeadm-controlplane"
# generate --infrastructure "metal3" $metal3Version "metal3"
generate --infrastructure "sidero" $sideroVersion "sidero"
generate --infrastructure "proxmox" $proxmoxVersion "proxmox" "--config https://raw.githubusercontent.com/sp-yduck/cluster-api-provider-proxmox/main/clusterctl.yaml"
