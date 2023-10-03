#!/bin/bash

set -eum

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${RQ_STACK:-ci}"
talosconfig="${RQ_TALOSCONFIG:-"$root/.talos/$stack/talosconfig"}"
kubeconfig="${RQ_KUBECONFIG:-"$root/.kube/$stack/config"}"

if [ "$stack" = "prod" ] || [ "$(terraform workspace show)" = "rosequartz-prod" ]; then
    echo "Cannot operate on prod"
    exit 0
fi

echo "Destroying terraform configuration..."
timeout 1m terraform -chdir="$root" destroy -var-file="vars/ci.tfvars" -auto-approve

echo "Destroying cluster..."
docker compose -f "$cwd/docker-compose.yaml" down -v

rm "$talosconfig" "$kubeconfig"
