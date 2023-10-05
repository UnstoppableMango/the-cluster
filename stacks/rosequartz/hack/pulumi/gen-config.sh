#!/bin/bash

set -eu

if [ -z ${RQ_SECRETS_FILE+x} ]; then
    echo "Secrets must be provided"
    exit 1
fi

if [ -z ${RQ_CLUSTER_NAME+x} ]; then
    echo "Cluster name must be provided"
    exit 1
fi

if [ -z ${RQ_ENDPOINT+x} ]; then
    echo "Endpoint must be provided"
    exit 1
fi

if [ -z ${RQ_K8S_VERSION+x} ]; then
    echo "Kubernetes version must be provided"
    exit 1
fi

if [ -z ${RQ_TALOS_VERSION+x} ]; then
    echo "Talos version must be provided"
    exit 1
fi

TYPE="${RQ_OUTPUT_TYPE:-controlplane}"
CLUSTER_NAME="$RQ_CLUSTER_NAME"
ENDPOINT="$RQ_ENDPOINT"
K8S_VERSION="$RQ_K8S_VERSION"
TALOS_VERSION="v$RQ_TALOS_VERSION"

talosctl gen config "$CLUSTER_NAME" "$ENDPOINT" \
    --with-secrets "$RQ_SECRETS_FILE" \
    --with-docs='false' \
    --with-examples='false' \
    --kubernetes-version "$K8S_VERSION" \
    --talos-version "$TALOS_VERSION" \
    --output-types "$TYPE" \
    --output -

# if [ "$TYPE" = "talosconfig" ]; then
#     talosctl config node "$RQ_NODE_IP"
# fi
