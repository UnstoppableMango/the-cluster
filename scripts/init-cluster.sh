#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
clusterName="${TC_CLUSTER_NAME:-rosequartz}"
projectDir="$root/clusters/$clusterName"

echo "Creating nodes..."
timeout 1m docker compose -f "$projectDir/hack/docker-compose.yaml" up -d
