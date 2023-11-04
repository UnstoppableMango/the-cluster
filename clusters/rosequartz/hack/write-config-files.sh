#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="$(pulumi -C "$root" stack --show-name)"
k8sDir="$root/.kube/$stack"
talosDir="$root/.talos/$stack"
mkdir -p "$k8sDir"
mkdir -p "$talosDir"

echo "Writing kubeconfig..."
pulumi stack output --show-secrets kubeconfig > "$k8sDir/config"

echo "Writing talosconfig..."
pulumi stack output --show-secrets talosconfig > "$talosDir/talosconfig.yaml"
