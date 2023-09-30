#!/bin/bash

set -eu

if [ -z ${ROSEQUARTZ_MACHINECONFIG+x} ]; then
    echo "Machine config must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_TALOSCONFIG+x} ]; then
    echo "Talosconfig must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_NODE_IP+x} ]; then
    echo "Node IP must be provided"
    exit 1
fi

PATCHES=()
for patch in "$@"; do
    PATCHES+=("--config-patch $patch")
done

TALOSCONFIG="$ROSEQUARTZ_TALOSCONFIG"
NODE_IP="$ROSEQUARTZ_NODE_IP"

if ! [ -z ${ROSEQUARTZ_DELAY+x} ]; then
    echo "Sleeping for ${ROSEQUARTZ_DELAY}s"
    sleep $ROSEQUARTZ_DELAY
fi

talosctl apply-config \
    --insecure \
    --file "$ROSEQUARTZ_MACHINECONFIG" \
    --talosconfig "$TALOSCONFIG" \
    --nodes "$NODE_IP" \
    "${PATCHES[@]}"
