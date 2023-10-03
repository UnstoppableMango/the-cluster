#!/bin/bash

set -eum

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${RQ_STACK:-ci}"
talosconfig="${RQ_TALOSCONFIG:-"$root/.talos/$stack/talosconfig"}"
kubeconfig="${RQ_KUBECONFIG:-"$root/.kube/$stack/config"}"

if [ ${CI+x} ]; then
    trap "docker logs rosequartz-talos-controlplane-1" EXIT
fi

echo "Creating cluster..."
timeout 1m docker compose -f "$cwd/docker-compose.yaml" up -d

# Wait to enter maintenance mdoe
sleep 3

echo "Applying terraform configuration..."
timeout 5m terraform -chdir="$root" apply -var-file="vars/$stack.tfvars" -auto-approve

mkdir -p "$(dirname "$talosconfig")"
mkdir -p "$(dirname "$kubeconfig")"

terraform output -raw talosconfig >"$talosconfig"
terraform output -raw kubeconfig >"$kubeconfig"
