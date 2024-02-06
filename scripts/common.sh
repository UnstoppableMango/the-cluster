#!/bin/bash

root="$(git rev-parse --show-toplevel)"

function init_cluster() {
    projectDir="$root/clusters/rosequartz"
    stack="${RQ_STACK:-"$(hostname)"}"
    copyStack="local"
    tagName="local"

    case "${CI:-}" in
        'true'|1) copyStack="ci" tagName="ci";;
    esac

    if [ -z "$(pulumi -C "$projectDir" stack ls --json | jq -r ".[].name | select(. == \"$stack\")")" ]; then
        echo "Initializing stack for $stack..."
        pulumi stack init "$stack" --copy-config-from "$copyStack"
        pulumi stack tag set "$tagName" true
    else
        echo "Selecting stack $stack..."
        pulumi stack select "$stack"
    fi

    echo "Creating cluster..."
    timeout 1m docker compose -f "$projectDir/hack/docker-compose.yaml" up -d
}
