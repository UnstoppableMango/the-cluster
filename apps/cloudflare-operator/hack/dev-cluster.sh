#!/bin/bash
set -eum

export TC_CLUSTER_NAME='rosequartz'
root="$(git rev-parse --show-toplevel)"
"$root/scripts/init-cluster.sh"
"$root/scripts/deploy-cluster.sh"
