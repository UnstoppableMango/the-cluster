#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/actions-runner-controller"
outDir="$root/infra/crds/manifests"
version="$(pulumi -C "$projDir" -s codegen config get --path 'versions.actionsRunnerController')"

kustomize build "https://github.com/actions/actions-runner-controller/config/crd?timeout=120&ref=$version" \
  | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$outDir"
