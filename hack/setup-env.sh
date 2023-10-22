#!/bin/bash

root="$(git rev-parse --show-toplevel)"

echo "Setting up environment variables..."

export RQ_STACK="dev"
export RQ_DIR="$root/clusters/rosequartz"
export KUBECONFIG="$RQ_DIR/.kube/$RQ_STACK/config"
export TALOSCONFIG="$RQ_DIR/.talos/$RQ_STACK/talosconfig"
