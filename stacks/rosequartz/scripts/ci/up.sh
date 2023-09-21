#!/bin/bash

set -eum

scripts="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)/.."
root="$scripts/.."

function create {
    echo "Creating cluster..."
    . "$scripts/create-cluster.sh"
}

function apply {
    echo "Applying terraform configuration..."
    terraform -chdir="$root" apply -var-file="vars/ci.tfvars" -auto-approve
}

(trap 'kill 0' SIGINT; create & sleep 5 && apply & wait)
