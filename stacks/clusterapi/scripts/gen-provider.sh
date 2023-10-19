#!/bin/bash

set -e

if ! command -v crd2pulumi >/dev/null 2>&1; then
    echo "Install kubectl-slice first https://github.com/patrickdappollonio/kubectl-slice#installation"
    exit 0
fi

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

providerDir="$root/providers"
mkdir -p "$providerDir"

capiVersion="$(awk -F= '$1 == "kubernetes-sigs/cluster-api" {print $2}' "$root/.versions")"
metal3Version="$(awk -F= '$1 == "metal3-io/cluster-api-provider-metal3" {print $2}' "$root/.versions")"
cabptVersion="$(awk -F= '$1 == "siderolabs/cluster-api-bootstrap-provider-talos" {print $2}' "$root/.versions")"
cacpptVersion="$(awk -F= '$1 == "siderolabs/cluster-api-control-plane-provider-talos" {print $2}' "$root/.versions")"
sideroVersion="$(awk -F= '$1 == "siderolabs/sidero" {print $2}' "$root/.versions")"
proxmoxVersion="$(awk -F= '$1 == "sp-yduck/cluster-api-provider-proxmox" {print $2}' "$root/.versions")"

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
