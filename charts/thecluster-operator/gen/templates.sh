#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
chartDir="$root/charts/thecluster-operator"
crdsDir="$chartDir/crds"
templatesDir="$chartDir/templates"
outDir="$templatesDir/generated"
manifests="$(kustomize build "$root/operator/default")"

[ -d "$crdsDir" ] || mkdir "$crdsDir"
[ -d "$outDir" ] || mkdir "$outDir"

echo "$manifests" | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$crdsDir"

echo "$manifests" | kubectl slice \
    --exclude-kind CustomResourceDefinition,Deployment \
    --skip-non-k8s \
    --template '{{.kind | lower}}.yaml' \
    --output-dir "$outDir"
