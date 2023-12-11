#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"

>&2 echo "Getting versions..."
cappxVersion="$(yq -r '.value' "$root/gen/versions/cappx")"

>&2 echo "Generating config file..."
cat >"$root/gen/clusterctl/config.yaml" <<EOL
providers:
  - name: proxmox
    url: https://github.com/k8s-proxmox/cluster-api-provider-proxmox/releases/$cappxVersion/infrastructure-components.yaml
    type: InfrastructureProvider
EOL
