#!/bin/bash

set -eum

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

echo "Creating cluster..."
timeout 1m docker compose -f "$cwd/docker-compose.yaml" up -d

# Wait to enter maintenance mdoe
sleep 3

echo "Applying terraform configuration..."
timeout 10m terraform -chdir="$root" apply -var-file="vars/ci.tfvars" -auto-approve

stack="${ROSEQUARTZ_STACK:-ci}"
talosconfig="${ROSEQUARTZ_TALOSCONFIG:-"$root/.talos/$stack/talosconfig"}"
kubeconfig="${ROSEQUARTZ_KUBECONFIG:-"$root/.kube/$stack/config"}"

mkdir -p "$(dirname "$talosconfig")"
mkdir -p "$(dirname "$kubeconfig")"

terraform output -raw talosconfig >"$talosconfig"
terraform output -raw kubeconfig >"$kubeconfig"
