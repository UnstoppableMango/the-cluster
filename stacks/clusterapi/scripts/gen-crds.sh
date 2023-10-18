#!/bin/bash

set -e

if ! command -v crd2pulumi >/dev/null 2>&1; then
    echo "Install crd2pulumi first https://github.com/pulumi/crd2pulumi#building-and-installation"
    exit 0
fi

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

echo "Generating CRDs for nodejs..."
crd2pulumi providers/*/crds.yaml \
    --nodejsPath="$root/crds" \
    --force
