#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
chartDir="$root/charts/thecluster-operator"
crdsDir="$chartDir/crds"
templatesDir="$chartDir/templates"
manifests="$(kustomize build "$chartDir/bases")"

[ -d "$crdsDir" ] || mkdir "$crdsDir"
[ -d "$templatesDir" ] || mkdir "$templatesDir"
rm "$crdsDir"/*.yaml "$templatesDir"/*.yaml

echo "$manifests" | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$chartDir/crds"

echo "$manifests" | kubectl slice \
    --exclude-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.kind | lower}}.yaml' \
    --output-dir "$chartDir/templates"
