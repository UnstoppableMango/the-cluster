#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
clusterName="${TC_CLUSTER_NAME:-rosequartz}"
projectDir="$root/clusters/$clusterName"
stack="${TC_STACK:-$(pulumi -C "$projectDir" stack --show-name)}"
configDir="$projectDir/.config/$stack"
mkdir -p "$configDir"

outputs="$(pulumi -C "$projectDir" stack -s "$stack" output --show-secrets)"

echo "Writing kubeconfig to $configDir/kubeconfig..."
jq '.kubeconfig' "$outputs" > "$configDir/kubeconfig"
chmod 600 "$configDir/kubeconfig"

echo "Writing talosconfig to $configDir/talosconfig.yaml..."
jq '.talosconfig' "$outputs" > "$configDir/talosconfig.yaml"
chmod 600 "$configDir/talosconfig.yaml"
