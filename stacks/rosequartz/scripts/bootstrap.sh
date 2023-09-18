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

TALOSCONFIG="$ROSEQUARTZ_TALOSCONFIG"
NODE_IP="$ROSEQUARTZ_NODE_IP"

talosctl bootstrap \
    --nodes "$NODE_IP" \
    --talosconfig "$TALOSCONFIG"
