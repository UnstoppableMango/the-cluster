#!/bin/bash

root="$(git rev-parse --show-toplevel)"
work="$(mktemp --directory)"
dockerfile="$root/containers/operator/Dockerfile"
goversion="$(go mod edit -json | jq -r '.Go')"

mkdir -p {cmd,containers}/operator

pushd "$work" || exit
trap popd EXIT

kubebuilder init \
  --domain thecluster.io \
  --repo github.com/unstoppablemango/the-cluster \
  --license none \
  --project-name the-cluster \
  --plugins go/v4

mv .golangci.yml PROJECT "$root"
cp -rp config test "$root"
mv cmd/main.go "$root/cmd/operator"
mv Dockerfile "$root/containers/operator"
mv .dockerignore "$root/containers/operator/Dockerfile.dockerignore"

replaceMain='s|cmd/main.go|cmd/operator/main.go|g'
replaceGoVersion="s|golang:.* AS|golang:${goversion} AS|"

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "$replaceMain" "$dockerfile"
  sed -i '' "$replaceGoVersion" "$dockerfile"
else
  sed -i "$replaceMain" "$dockerfile"
  sed -i "$replaceGoVersion" "$dockerfile"
fi
