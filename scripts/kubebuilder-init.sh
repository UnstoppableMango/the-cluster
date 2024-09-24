#!/bin/bash
set -e

root="$(git rev-parse --show-toplevel)"
dockerfile="$root/cmd/operator/Dockerfile"
goversion="$(go mod edit -json | jq -r '.Go')"

pushd "$root/cmd/operator" || exit 1
trap popd EXIT

kubebuilder init \
  --domain thecluster.io \
  --project-name the-cluster

replaceGoVersion="s|golang:.* AS|golang:${goversion} AS|"

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "$replaceGoVersion" "$dockerfile"
else
  sed -i "$replaceGoVersion" "$dockerfile"
fi
