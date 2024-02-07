#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
clusterName="${TC_CLUSTER_NAME:-rosequartz}"
stack="${TC_STACK:-$(hostname)}"
projectDir="$root/clusters/$clusterName"

case "$stack" in
    'prod')
    echo '❗️ Refusing to destroy prod stack ❗️'
    exit 1
    ;;
esac

if [[ $(pulumi -C "$projectDir" stack -s "$stack" export | jq -r '.deployment.resources | length') -gt 0 ]]; then
    echo "Cleaning up stack..."
    pulumi -C "$projectDir" -s "$stack" destroy --yes
fi

echo "Destroying nodes..."
docker compose -f "$projectDir/hack/docker-compose.yaml" down --volumes
