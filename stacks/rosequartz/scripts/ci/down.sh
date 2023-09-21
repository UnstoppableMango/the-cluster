#!/bin/bash

set -eum

scripts="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)/.."
root="$scripts/.."

function unapply {
    echo "Destroying terraform configuration..."
    terraform -chdir="$root" apply -var-file="vars/ci.tfvars" -auto-approve
}

function destroy {
    echo "Destroying cluster..."
    . "$scripts/destroy-cluster.sh"
}

unapply
destroy
