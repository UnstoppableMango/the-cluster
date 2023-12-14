#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/external-snapshotter"
outDir="$root/infra/crds/manifests"
version="$(pulumi -C "$projDir" -s codegen config get --path 'versions.externalSnapshotter')"

kustomize build "https://github.com/kubernetes-csi/external-snapshotter/client/config/crd?timeout=120&ref=$version" \
  | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$outDir"
