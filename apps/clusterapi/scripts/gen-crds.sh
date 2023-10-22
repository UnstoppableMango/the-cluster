#!/bin/bash

set -e

if ! command -v crd2pulumi >/dev/null 2>&1; then
    echo "Install crd2pulumi first https://github.com/pulumi/crd2pulumi#building-and-installation"
    exit 1
fi

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

rm -r "$root/crds"

echo "Generating CRDs for nodejs..."

# Currently an error with rolloutStrategy in talos-controlplane
# crd2pulumi providers/*/crds.yaml \
#     --nodejsPath="$root/crds" \
#     --force

crd2pulumi $(ls $root/providers/*/crds.yaml | grep -viE "core|proxmox|talos-controlplane") \
    --nodejsPath="$root/crds"
