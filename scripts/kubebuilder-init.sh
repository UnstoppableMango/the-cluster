#!/bin/bash
set -e

root="$(git rev-parse --show-toplevel)"
dockerfile="$root/containers/operator/Dockerfile"
goversion="$(go mod edit -json | jq -r '.Go')"

kubebuilder init \
  --domain thecluster.io \
  --repo github.com/unstoppablemango/the-cluster \
  --license none \
  --project-name the-cluster

replaceMain='s|cmd/main.go|cmd/operator/main.go|g'
replaceGoVersion="s|golang:.* AS|golang:${goversion} AS|"

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "$replaceMain" "$dockerfile"
  sed -i '' "$replaceGoVersion" "$dockerfile"
else
  sed -i "$replaceMain" "$dockerfile"
  sed -i "$replaceGoVersion" "$dockerfile"
fi
