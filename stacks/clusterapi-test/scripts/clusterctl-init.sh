#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

capiVersion="$(cat "$root/.versions/cluster-api")"
kubeadmVersion="$(cat "$root/.versions/kubeadm")"
metal3Version="$(cat "$root/.versions/metal3")"
cabptVersion="$(cat "$root/.versions/cabpt")"
cacpptVersion="$(cat "$root/.versions/cacppt")"

export CLUSTER_TOPOLOGY=true

clusterctl init \
    --core "cluster-api:v$capiVersion" \
    --bootstrap "kubeadm:v$kubeadmVersion" \
    --control-plane "kubeadm:v$kubeadmVersion"

# clusterctl init \
#     --bootstrap "talos:v$cabptVersion" \
#     --control-plane "talos:v$cacpptVersion" \
#     --infrastructure "metal3:v$metal3Version" \
#     --infrastructure docker

clusterctl init --infrastructure docker
