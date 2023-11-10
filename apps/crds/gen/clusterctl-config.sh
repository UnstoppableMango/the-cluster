#!/bin/bash
set -eum

if ! command -v pulumi >/dev/null 2>&1; then
    echo "Install pulumi first https://www.pulumi.com/docs/install/"
    exit 1
fi

root="$(git rev-parse --show-toplevel)/apps/crds"
oldStack="$(pulumi -C "$root" stack --show-name 2>/dev/null || true)"

function cleanup() {
    if [ -z "$oldStack" ]; then
        pulumi -C "$root" stack unselect
    else
        echo "Switching back to stack $oldStack..."
        pulumi -C "$root" stack select "$oldStack"
    fi
}

trap cleanup EXIT

echo "Selecting codegen stack..."
pulumi -C "$root" stack select codegen

function version() {
    dep=$1
    pulumi -C "$root" config get --path "versions.$dep"
}

echo "Getting versions..."
coreVersion="$(version "clusterapi")"
proxmoxVersion="$(version "proxmox")"
sideroVersion="$(version "sidero")"
cabptVersion="$(version "cabpt")"
cacpptVersion="$(version "cacppt")"

echo "Writing clusterctl.yaml file..."
cat >"$root/clusterctl.yaml" <<EOL
providers:
  - name: proxmox
    url: https://github.com/sp-yduck/cluster-api-provider-proxmox/releases/v$proxmoxVersion/infrastructure-components.yaml
    type: InfrastructureProvider
EOL
