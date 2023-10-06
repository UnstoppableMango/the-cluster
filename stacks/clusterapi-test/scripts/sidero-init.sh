#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

capiVersion="$(cat "$root/.versions/cluster-api")"
kubeadmVersion="$(cat "$root/.versions/kubeadm")"
metal3Version="$(cat "$root/.versions/metal3")"
cabptVersion="$(cat "$root/.versions/cabpt")"
cacpptVersion="$(cat "$root/.versions/cacppt")"
sideroVersion="$(cat "$root/.versions/sidero")"

export CLUSTER_TOPOLOGY=true

export SIDERO_CONTROLLER_MANAGER_HOST_NETWORK=true
export SIDERO_CONTROLLER_MANAGER_DEPLOYMENT_STRATEGY=Recreate
export SIDERO_CONTROLLER_MANAGER_API_ENDPOINT="192.168.1.69"
export SIDERO_CONTROLLER_MANAGER_SIDEROLINK_ENDPOINT="192.168.1.69"

clusterctl init \
    --core "cluster-api:v$capiVersion" \
    --bootstrap "talos:v$cabptVersion" \
    --control-plane "talos:v$cacpptVersion" \
    --infrastructure "sidero:v$sideroVersion"
