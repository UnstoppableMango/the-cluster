#!/bin/bash
set -eum

if ! command -v crd2pulumi >/dev/null 2>&1; then
    echo "Install crd2pulumi first https://github.com/pulumi/crd2pulumi#building-and-installation"
    exit 0
fi

repoRoot="$(git rev-parse --show-toplevel)"
root="$repoRoot/apps/crds"
libDir="$repoRoot/lib/crds"

mkdir -p "$root/manifests/gen"
if [ 0 -ge $(ls "$root"/manifests/*/output.yaml | wc -l) ]; then
    echo "Run ./gen/capi.sh first"
    exit 1
fi

echo "Selecting codegen stack..."
oldStack="$(pulumi -C "$root" stack --show-name)"
pulumi -C "$root" stack select codegen

echo "Getting versions..."
certManagerVersion="$(pulumi -C "$root" config get --path 'versions.certManager')"
pulumiOperatorVersion="$(pulumi -C "$root" config get --path 'versions.pulumiOperator')"

echo "Cleaning lib dir..."
[ -d "$libDir" ] && rm -r "$libDir"

echo "Generating crds lib..."
crd2pulumi --nodejsPath="$libDir" --force \
    "https://github.com/cert-manager/cert-manager/releases/download/v$certManagerVersion/cert-manager.crds.yaml" \
    "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/v$pulumiOperatorVersion/deploy/crds/pulumi.com_programs.yaml" \
    "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/v$pulumiOperatorVersion/deploy/crds/pulumi.com_stacks.yaml" \
    "$root"/manifests/*/output.yaml

echo "Fixing quotes..."
sed -i '' "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$libDir/types/input.ts"
sed -i '' "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$libDir/types/output.ts"

echo "Switching back to stack $oldStack..."
pulumi -C "$root" stack select "$oldStack"
