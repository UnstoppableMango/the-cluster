#!/bin/bash
set -eum

if ! command -v talosctl >/dev/null 2>&1; then
    echo "Install talosctl first https://www.talos.dev/v1.5/introduction/quickstart/#talosctl"
    exit 1
fi

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="$(pulumi stack --show-name)"
clusterName="$(pulumi -C "$root" config get clusterName)"
kubeDir="$root/.kube/$stack"
talosDir="$root/.talos/$stack"

export KUBECONFIG="$kubeDir/config"
export TALOSCONFIG="$talosDir/config"

talosctl cluster destroy --name "$clusterName-bootstrap"

[ -f "$KUBECONFIG" ] && rm "$KUBECONFIG"
[ -f "$TALOSCONFIG" ] && rm "$TALOSCONFIG"
