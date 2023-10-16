#!/bin/bash

set -eum

root="$(git rev-parse --show-toplevel)/stacks/rosequartz"
cwd="$root/hack"

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
docker compose -f "$root/ci/docker-compose.yaml" down -v

rm "$talosconfig" "$kubeconfig"
