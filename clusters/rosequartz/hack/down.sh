#!/bin/bash

set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
cwd="$root/hack"

stack="$(hostname)"

if [ -z "$(pulumi -C "$root" stack ls --json | jq -r ".[].name | select(. == \"$stack\")")" ]; then
    echo "Initializing stack for $stack..."
    pulumi stack init $stack --copy-config-from local
    pulumi stack tag set local true
else
    pulumi stack select "$stack"
fi

talosconfig="$root/.talos/$stack/talosconfig"
kubeconfig="$root/.kube/$stack/config"

echo "Destroying cluster..."
docker compose -f "$root/ci/docker-compose.yaml" down -v
