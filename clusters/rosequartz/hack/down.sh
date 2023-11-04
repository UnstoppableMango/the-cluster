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
    echo "Selecting stack $stack..."
    pulumi stack select "$stack"
fi

echo "Destroying cluster..."
docker compose -f "$cwd/docker-compose.yaml" down -v

[ -f "$root/.kube/$stack/config" ] && rm "$root/.kube/$stack/config"
[ -f "$root/.talos/$stack/talosconfig.yaml" ] && rm "$root/.talos/$stack/talosconfig.yaml"
