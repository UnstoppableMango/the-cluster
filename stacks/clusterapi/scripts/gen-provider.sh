#!/bin/bash

set -eu

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

providerDir="$root/providers"
mkdir -p "$providerDir"

capiVersion="$(awk -F= '$1 == "kubernetes-sigs/cluster-api" {print $2}' "$root/.versions")"
metal3Version="$(awk -F= '$1 == "metal3-io/cluster-api-provider-metal3" {print $2}' "$root/.versions")"
cabptVersion="$(awk -F= '$1 == "siderolabs/cluster-api-bootstrap-provider-talos" {print $2}' "$root/.versions")"
cacpptVersion="$(awk -F= '$1 == "siderolabs/cluster-api-control-plane-provider-talos" {print $2}' "$root/.versions")"
sideroVersion="$(awk -F= '$1 == "siderolabs/sidero" {print $2}' "$root/.versions")"

export CLUSTER_TOPOLOGY=true

echo "Generating core v$capiVersion"
clusterctl generate provider --core "cluster-api:v$capiVersion" > "$providerDir/core.yaml"

echo "Generating kubeadm bootstrap v$capiVersion"
clusterctl generate provider --bootstrap "kubeadm:v$capiVersion" > "$providerDir/kubeadm-bootstrap.yaml"

echo "Generating talos bootstrap v$cabptVersion"
clusterctl generate provider --bootstrap "talos:v$cabptVersion" > "$providerDir/talos-bootstrap.yaml"

echo "Generating talos controlplane v$cacpptVersion"
clusterctl generate provider --control-plane "talos:v$cacpptVersion" > "$providerDir/talos-controlplane.yaml"

echo "Generating kubeadm controlplane v$capiVersion"
clusterctl generate provider --control-plane "kubeadm:v$capiVersion" > "$providerDir/kubeadm-controlplane.yaml"

echo "Generating metal3 infrastructure v$metal3Version"
clusterctl generate provider --infrastructure "metal3:v$metal3Version" > "$providerDir/metal3.yaml"

export SIDERO_CONTROLLER_MANAGER_HOST_NETWORK=true
export SIDERO_CONTROLLER_MANAGER_DEPLOYMENT_STRATEGY=Recreate
export SIDERO_CONTROLLER_MANAGER_API_ENDPOINT="${RQ_ENDPOINT:-"10.5.0.2"}"
echo "Generating sidero infrastructure v$sideroVersion"
clusterctl generate provider --infrastructure "sidero:v$sideroVersion" > "$providerDir/sidero.yaml"
