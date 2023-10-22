#!/bin/bash

set -eu

if [ -z ${RQ_MACHINECONFIG+x} ]; then
    echo "Machine config must be provided"
    exit 1
fi

if [ -z ${RQ_TALOSCONFIG+x} ]; then
    echo "Talosconfig must be provided"
    exit 1
fi

if [ -z ${RQ_NODE_IP+x} ]; then
    echo "Node IP must be provided"
    exit 1
fi

PATCHES=()
for patch in "$@"; do
    PATCHES+=("--config-patch $patch")
done

TALOSCONFIG="$RQ_TALOSCONFIG"
NODE_IP="$RQ_NODE_IP"

if ! [ -z ${RQ_DELAY+x} ]; then
    echo "Sleeping for ${RQ_DELAY}s"
    sleep $RQ_DELAY
fi

talosctl apply-config \
    --insecure \
    --file "$RQ_MACHINECONFIG" \
    --talosconfig "$TALOSCONFIG" \
    --nodes "$NODE_IP" \
    "${PATCHES[@]}"
