#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/pulumi-operator"
outDir="$root/infra/crds/manifests"
version="$(pulumi -C "$projDir" -s codegen config get --path 'versions.pulumiOperator')"

curl -sSL "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/$version/deploy/crds/pulumi.com_programs.yaml" \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$outDir"

curl -sSL "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/$version/deploy/crds/pulumi.com_stacks.yaml" \
    | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$outDir"
