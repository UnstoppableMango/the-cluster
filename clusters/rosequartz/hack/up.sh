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

echo "Creating cluster..."
timeout 1m docker compose -f "$cwd/docker-compose.yaml" up -d
