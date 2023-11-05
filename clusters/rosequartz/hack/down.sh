#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="${RQ_STACK:-"$(hostname)"}"

if [ -n "$(pulumi -C "$root" stack ls --json | jq -r ".[].name | select(. == \"$stack\")")" ]; then
    echo "Selecting stack $stack..."
    pulumi stack select "$stack"
fi

echo "Destroying cluster..."
docker compose -f "$root/hack/docker-compose.yaml" down -v

[ -f "$root/.kube/$stack/config" ] && rm "$root/.kube/$stack/config"
[ -f "$root/.talos/$stack/talosconfig.yaml" ] && rm "$root/.talos/$stack/talosconfig.yaml"
