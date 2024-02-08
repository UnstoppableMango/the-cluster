#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
clusterName="${TC_CLUSTER_NAME:-rosequartz}"
stack="${TC_STACK:-$(hostname)}"
projectDir="$root/clusters/$clusterName"
copyStack="local"
tagName="local"

case "${CI:-}" in
    'true'|1) copyStack="ci" tagName="ci";;
esac

if [ -z "$(pulumi -C "$projectDir" stack ls --json | jq -r ".[].name | select(. == \"$stack\")")" ]; then
    echo "Initializing stack for $stack..."
    pulumi -C "$projectDir" stack init "$stack" --copy-config-from "$copyStack"
    pulumi -C "$projectDir" stack -s "$stack" tag set "$tagName" true
fi

pulumi -C "$projectDir" -s "$stack" up --skip-preview --yes
