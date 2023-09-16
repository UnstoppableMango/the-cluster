#!/bin/bash

set -eu

source "$(dirname "$0")/talos-vars.sh"

talosctl cluster destroy \
    --name "$CLUSTER_NAME" \
    --provisioner docker \
    --state "$TALOS_STATE" \
    --talosconfig "$TALOSCONFIG"

rm -r "$TALOS_DIR" "$KUBE_DIR"
