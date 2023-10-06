#!/bin/bash

set -eu

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

providerDir="$root/providers"
mkdir -p "$providerDir"

capiVersion="$(cat "$root/.versions/cluster-api")"
kubeadmVersion="$(cat "$root/.versions/kubeadm")"
metal3Version="$(cat "$root/.versions/metal3")"
cabptVersion="$(cat "$root/.versions/cabpt")"
cacpptVersion="$(cat "$root/.versions/cacppt")"
sideroVersion="$(cat "$root/.versions/sidero")"

export CLUSTER_TOPOLOGY=true

clusterctl generate provider --core "cluster-api:v$capiVersion" > "$providerDir/core.yaml"

clusterctl generate provider --bootstrap "kubeadm:v$kubeadmVersion" > "$providerDir/kubeadm-bootstrap.yaml"

clusterctl generate provider --bootstrap "talos:v$cabptVersion" > "$providerDir/talos-bootstrap.yaml"

clusterctl generate provider --control-plane "talos:v$cacpptVersion" > "$providerDir/talos-controlplane.yaml"

clusterctl generate provider --control-plane "kubeadm:v$kubeadmVersion" > "$providerDir/kubeadm-controlplane.yaml"

clusterctl generate provider --infrastructure "metal3:v$metal3Version" > "$providerDir/metal3.yaml"

clusterctl generate provider --infrastructure "sidero:v$sideroVersion" > "$providerDir/sidero.yaml"
