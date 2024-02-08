#!/bin/bash
set -eum

export TC_CLUSTER_NAME='rosequartz'
root="$(git rev-parse --show-toplevel)"
pulumi -C "$root/apps/cert-manager" -s "$(hostname)" down --skip-preview --yes
"$root/scripts/destroy-cluster.sh"
