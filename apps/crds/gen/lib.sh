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
if [ 0 -ge "$(ls "$root"/manifests/*/output.yaml | wc -l)" ]; then
    echo "Run ./gen/capi.sh first"
    exit 1
fi

oldStack="$(pulumi -C "$root" stack --show-name)"

function cleanup() {
    echo "Switching back to stack $oldStack..."
    pulumi -C "$root" stack select "$oldStack"
}

trap cleanup EXIT

echo "Selecting codegen stack..."
pulumi -C "$root" stack select codegen

echo "Getting versions..."
certManagerVersion="$(pulumi -C "$root" config get --path 'versions.certManager')"
pulumiOperatorVersion="$(pulumi -C "$root" config get --path 'versions.pulumiOperator')"
nginxIngressOperatorVersion="$(pulumi -C "$root" config get --path 'versions.nginxIngressHelmOperator')"

echo "Kustomizing Nginx Ingress Operator..."
nginxIngressOperatorYaml="$(mktemp /tmp/nginx-ingress-operator-XXXX.yaml)"
kustomize build "https://github.com/nginxinc/nginx-ingress-helm-operator//config/default/?timeout=120&ref=$nginxIngressOperatorVersion" \
  > "$nginxIngressOperatorYaml"
echo "$nginxIngressOperatorYaml"

echo "Cleaning lib dir..."
[ -d "$libDir" ] && rm -r "$libDir"

echo "Generating crds lib..."
crd2pulumi --nodejsPath="$libDir" --force \
    "https://github.com/cert-manager/cert-manager/releases/download/v$certManagerVersion/cert-manager.crds.yaml" \
    "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/v$pulumiOperatorVersion/deploy/crds/pulumi.com_programs.yaml" \
    "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/v$pulumiOperatorVersion/deploy/crds/pulumi.com_stacks.yaml" \
    "$nginxIngressOperatorYaml" \
    "$root"/manifests/*/output.yaml

echo "Fixing quotes..."
sed -i "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$libDir/types/input.ts"
sed -i "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$libDir/types/output.ts"
sed -i "s/metadata.omitempty/'metadata.omitempty'/" "$libDir/types/input.ts"
sed -i "s/metadata.omitempty/'metadata.omitempty'/" "$libDir/types/output.ts"

function renamePulumi() {
    echo "Fixing $1..."
    sed -i 's/namespace pulumi/namespace pulumiOperator/' "$1"
    sed -i 's/pulumi.v1/pulumiOperator.v1/' "$1"
    sed -i 's/pulumi from ".\/pulumi"/pulumiOperator from ".\/pulumi"/' "$1"
    sed -i 's/pulumi,/pulumiOperator,/' "$1"
}

export -f renamePulumi
find "$libDir/pulumi" -type f -exec bash -c 'renamePulumi "$0"' {} \;
renamePulumi "$libDir/types/input.ts"
renamePulumi "$libDir/types/output.ts"
renamePulumi "$libDir/index.ts"

echo "Installing packages..."
trap popd EXIT
pushd "$libDir"
npm install
