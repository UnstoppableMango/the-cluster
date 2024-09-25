#!/bin/bash

root="$(git rev-parse --show-toplevel)"

read -r -p 'Version: ' version
read -r -p 'Kind: ' kind
read -r -p 'Plural: ' plural

pushd "$root/cmd/operator" || exit 1
trap popd EXIT

set -o xtrace
"$root/bin/kubebuilder" create api \
    --controller \
    --resource \
    --group thecluster \
    --version "$version" \
    --kind "$kind" \
    --plural "$plural"
