#!/bin/bash
set -eum

if ! command -v crd2pulumi >/dev/null 2>&1; then
    echo "Install crd2pulumi first https://github.com/pulumi/crd2pulumi#building-and-installation"
    exit 0
fi

root="$(git rev-parse --show-toplevel)"
crdsDir="$root/apps/crds"

echo "Selecting codegen stack..."
pulumi -C "$crdsDir" stack select codegen

echo "Getting cert-manager version..."
certManagerVersion="$(pulumi -C "$crdsDir" config get --path 'cert-manager.version')"

crd2pulumi --nodejsPath="$root/lib/crds" --force \
    https://github.com/cert-manager/cert-manager/releases/download/v$certManagerVersion/cert-manager.crds.yaml
