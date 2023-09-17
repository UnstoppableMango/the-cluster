#!/bin/bash

set -eu

if [ -z ${ROSEQUARTZ_SECRETS_FILE+x} ]; then
    echo "Secrets must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_CLUSTER_NAME+x} ]; then
    echo "Cluster name must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_ENDPOINT+x} ]; then
    echo "Endpoint must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_K8S_VERSION+x} ]; then
    echo "Kubernetes version must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_TALOS_VERSION+x} ]; then
    echo "Talos version must be provided"
    exit 1
fi

TYPE="${ROSEQUARTZ_OUTPUT_TYPE:-controlplane}"
CLUSTER_NAME="$ROSEQUARTZ_CLUSTER_NAME"
ENDPOINT="$ROSEQUARTZ_ENDPOINT"
K8S_VERSION="$ROSEQUARTZ_K8S_VERSION"
TALOS_VERSION="v$ROSEQUARTZ_TALOS_VERSION"

talosctl gen config "$CLUSTER_NAME" "$ENDPOINT" \
    --with-secrets "$ROSEQUARTZ_SECRETS_FILE" \
    --with-docs='false' \
    --with-examples='false' \
    --kubernetes-version "$K8S_VERSION" \
    --talos-version "$TALOS_VERSION" \
    --output-types "$TYPE" \
    --output -
