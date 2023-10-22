#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="${RQ_STACK:-"$(hostname)"}"
configDir="$root/.config/$stack"

if [ -n "$(pulumi -C "$root" stack ls --json | jq -r ".[].name | select(. == \"$stack\")")" ]; then
    echo "Selecting stack $stack..."
    pulumi stack select "$stack"
fi

if [[ $(pulumi -C "$root" stack export | jq -r '.deployment.resources | length') -gt 0 ]]; then
    echo "Cleaning up stack..."
    pulumi -C "$root" destroy --yes
fi

echo "Destroying cluster..."
pushd "$root/ci"
docker compose down -v
popd

[ -f "$configDir/kubeconfig" ] && rm "$configDir/kubeconfig"
[ -f "$configDir/talosconfig.yaml" ] && rm "$configDir/talosconfig.yaml"
