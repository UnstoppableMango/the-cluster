#!/bin/bash

set -eum

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

echo "Destroying terraform configuration..."
timeout 1m terraform -chdir="$root" destroy -var-file="vars/ci.tfvars" -auto-approve

echo "Destroying cluster..."
docker compose -f "$cwd/docker-compose.yaml" down -v

stack="${ROSEQUARTZ_STACK:-ci}"
talosconfig="${ROSEQUARTZ_TALOSCONFIG:-"$root/.talos/$stack/talosconfig"}"
kubeconfig="${ROSEQUARTZ_KUBECONFIG:-"$root/.kube/$stack/config"}"

rm "$talosconfig" "$kubeconfig"
