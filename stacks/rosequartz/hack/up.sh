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

echo "Creating cluster..."
timeout 1m docker compose -f "$root/ci/docker-compose.yaml" up -d

# Wait to enter maintenance mdoe
sleep 3

echo "Applying terraform configuration..."
timeout 5m terraform -chdir="$root" apply -var-file="vars/$stack.tfvars" -auto-approve

mkdir -p "$(dirname "$talosconfig")"
mkdir -p "$(dirname "$kubeconfig")"

terraform output -raw talosconfig >"$talosconfig"
terraform output -raw kubeconfig >"$kubeconfig"
