#!/bin/bash
set -eum

if ! command -v crd2pulumi >/dev/null 2>&1; then
    echo "Install crd2pulumi first https://github.com/pulumi/crd2pulumi#building-and-installation"
    exit 0
fi

root="$(git rev-parse --show-toplevel)"
manifestsDir="$root/lib/crds/manifests"

mapfile -t manifests < <(find "$manifestsDir" -type f -path '*pulumi*')
crd2pulumi "${manifests[@]}" --dotnetPath "$root/lib/pulumi-crds"
