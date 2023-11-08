#!/bin/bash
set -eum

if ! command -v pulumi >/dev/null 2>&1; then
    echo "Install pulumi first https://www.pulumi.com/docs/install/"
    exit 1
fi

root="$(git rev-parse --show-toplevel)/apps/clusterapi"
stack="$(pulumi -C "$root" stack --show-name 2>/dev/null || echo "$STACK")"

if [ -z "$stack" ]; then
    echo "Please select a stack with \`pulumi stack select\` or set the STACK environment variable"
    exit 1
fi

function cleanup() {
    [ -z "$stack" ] && return 0
    echo "Switching back to stack $stack..."
    pulumi -C "$root" stack select "$stack"
}

trap cleanup EXIT
pulumi -C "$root" stack select "$stack"

function version() {
    dep=$1
    pulumi -C "$root" config get --path "versions.$dep"
}

echo "Getting versions..."
proxmoxVersion="$(version "proxmox")"

cat >"$root/clusterctl.yaml" <<EOL
providers:
  - name: proxmox
    url: https://github.com/sp-yduck/cluster-api-provider-proxmox/releases/v$proxmoxVersion/infrastructure-components.yaml
    type: InfrastructureProvider
EOL
