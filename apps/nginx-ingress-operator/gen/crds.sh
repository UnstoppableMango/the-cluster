#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/nginx-ingress-operator"
outDir="$root/infra/crds/manifests"
version="$(pulumi -C "$projDir" -s codegen config get --path 'versions.nginxIngressHelmOperator')"

echo "Kustomizing Nginx Ingress Operator..."
kustomize build "https://github.com/nginxinc/nginx-ingress-helm-operator/config/default/?timeout=120&ref=$version" \
  | kubectl slice \
    --include-kind CustomResourceDefinition \
    --skip-non-k8s \
    --template '{{.metadata.name | lower}}.yaml' \
    --output-dir "$outDir"
