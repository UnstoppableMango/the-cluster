#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="$(pulumi -C "$root" stack --show-name)"
configDir="$root/.config/$stack"
mkdir -p "$configDir"

echo "Writing kubeconfig to $configDir/kubeconfig..."
pulumi stack output --show-secrets kubeconfig > "$configDir/kubeconfig"
chmod 600 "$configDir/kubeconfig"

echo "Writing talosconfig to $configDir/talosconfig.yaml..."
pulumi stack output --show-secrets talosconfig > "$configDir/talosconfig.yaml"
chmod 600 "$configDir/talosconfig.yaml"
