#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
srcDir="$root/operator"
chartDir="$root/charts/thecluster-operator"
manifests="$(kustomize build "$srcDir")"

echo "$manifests" | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$chartDir/crds"

echo "$manifests" | kubectl slice \
    --exclude-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$chartDir/templates"
