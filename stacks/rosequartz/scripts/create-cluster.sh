#!/bin/bash

set -eu

source "$(dirname "$0")/talos-vars.sh"

talosctl cluster create \
    --name "$CLUSTER_NAME" \
    --provisioner docker \
    --state "$TALOS_STATE" \
    --talosconfig "$TALOSCONFIG" \
    --wait
