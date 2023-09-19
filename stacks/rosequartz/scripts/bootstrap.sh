#!/bin/bash

set -eu

if [ -z ${ROSEQUARTZ_TALOSCONFIG+x} ]; then
    echo "Talosconfig must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_NODE_IP+x} ]; then
    echo "Node IP must be provided"
    exit 1
fi

# TALOSCONFIG="$ROSEQUARTZ_TALOSCONFIG"
NODE_IP="$ROSEQUARTZ_NODE_IP"

if ! [ -z ${ROSEQUARTZ_DELAY+x} ]; then
    echo "Sleeping for ${ROSEQUARTZ_DELAY}s"
    sleep $ROSEQUARTZ_DELAY
fi

# talosctl bootstrap \
#     --nodes "$NODE_IP" \
#     --talosconfig "$TALOSCONFIG"

echo "Setting context to $ROSEQUARTZ_CLUSTER_NAME"
talosctl config context "$ROSEQUARTZ_CLUSTER_NAME" --talosconfig "$ROSEQUARTZ_TALOSCONFIG"

echo "Setting node to $NODE_IP"
talosctl config node "$NODE_IP" --talosconfig "$ROSEQUARTZ_TALOSCONFIG"

echo "Setting endpoint to https://localhost:50000"
talosctl config endpoint "https://localhost:50000" --talosconfig "$ROSEQUARTZ_TALOSCONFIG"

echo "Bootstrapping node"
talosctl bootstrap \
    --nodes "$NODE_IP" \
    --talosconfig "$ROSEQUARTZ_TALOSCONFIG"
