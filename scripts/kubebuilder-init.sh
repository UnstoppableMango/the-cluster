#!/bin/bash

root="$(git rev-parse --show-toplevel)"
work="$(mktemp --directory)"

mkdir -p {cmd,containers}/operator

pushd "$work" || exit
trap popd EXIT

kubebuilder init \
  --domain thecluster.io \
  --repo github.com/unstoppablemango/the-cluster \
  --license none \
  --project-name the-cluster \
  --plugins go/v4

mv .golangci.yml PROJECT config test "$root"
mv cmd/main.go "$root/cmd/operator"
mv Dockerfile "$root/containers/operator"
mv .dockerignore "$root/containers/operator/Dockerfile.dockerignore"
