#!/bin/bash

 set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

k8sVersion="$(cat "$root/.versions/k8s")"

clusterctl generate cluster clusterapi-test \
    --flavor development \
    --kubernetes-version "v$k8sVersion" \
    --control-plane-machine-count 3 \
    --worker-machine-count 3 \
    --infrastructure docker \
    > capi-quickstart.yaml
