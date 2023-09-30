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

CLUSTER_NAME="$ROSEQUARTZ_CLUSTER_NAME"
ENDPOINT="$ROSEQUARTZ_ENDPOINT"
SECRETS_FILE="$ROSEQUARTZ_SECRETS_FILE"
K8S_VERSION="$ROSEQUARTZ_K8S_VERSION"
TALOS_VERSION="v$ROSEQUARTZ_TALOS_VERSION"

talosctl gen config "$CLUSTER_NAME" "$ENDPOINT" \
    --with-secrets "$SECRETS_FILE" \
    --talos-version "$TALOS_VERSION" \
    --output-types "talosconfig" \
    --endpoints "$ENDPOINT" \
    --output -
