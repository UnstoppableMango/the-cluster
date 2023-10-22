#!/bin/bash

set -eu

if [ -z ${RQ_TALOSCONFIG+x} ]; then
    echo "Talosconfig must be provided"
    exit 1
fi

if [ -z ${RQ_NODE_IP+x} ]; then
    echo "Node IP must be provided"
    exit 1
fi

# TALOSCONFIG="$RQ_TALOSCONFIG"
NODE_IP="$RQ_NODE_IP"

if ! [ -z ${RQ_DELAY+x} ]; then
    echo "Sleeping for ${RQ_DELAY}s"
    sleep $RQ_DELAY
fi

# talosctl bootstrap \
#     --nodes "$NODE_IP" \
#     --talosconfig "$TALOSCONFIG"

echo "Setting context to $RQ_CLUSTER_NAME"
talosctl config context "$RQ_CLUSTER_NAME" --talosconfig "$RQ_TALOSCONFIG"

echo "Setting node to $NODE_IP"
talosctl config node "$NODE_IP" --talosconfig "$RQ_TALOSCONFIG"

echo "Setting endpoint to https://localhost:50000"
talosctl config endpoint "https://localhost:50000" --talosconfig "$RQ_TALOSCONFIG"

echo "Bootstrapping node"
talosctl bootstrap \
    --nodes "$NODE_IP" \
    --talosconfig "$RQ_TALOSCONFIG"
