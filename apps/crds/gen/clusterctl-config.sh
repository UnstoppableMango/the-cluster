#!/bin/bash
set -eum

if ! command -v pulumi >/dev/null 2>&1; then
    echo "Install pulumi first https://www.pulumi.com/docs/install/"
    exit 1
fi

root="$(git rev-parse --show-toplevel)/apps/crds"

echo "Selecting codegen stack..."
oldStack="$(pulumi -C "$root" stack --show-name)"
pulumi -C "$root" stack select codegen

function version() {
    dep=$1
    pulumi -C "$root" config get --path "$dep.version"
}

echo "Getting versions..."
coreVersion="$(version "clusterapi")"
proxmoxVersion="$(version "proxmox")"
sideroVersion="$(version "sidero")"
cabptVersion="$(version "cabpt")"
cacpptVersion="$(version "cacppt")"

cat >"$root/clusterctl.yaml" <<EOL
providers:
  - name: proxmox
    url: https://github.com/sp-yduck/cluster-api-provider-proxmox/releases/v$proxmoxVersion/infrastructure-components.yaml
    type: InfrastructureProvider
EOL

echo "Switching back to stack $oldStack..."
pulumi -C "$root" stack select "$oldStack"
