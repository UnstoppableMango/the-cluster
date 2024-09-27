#!/bin/bash

root="$(git rev-parse --show-toplevel)"

read -r -p 'Group: ' group
read -r -p 'Version: ' version
read -r -p 'Kind: ' kind
read -r -p 'Plural: ' plural

pushd "$root/operator" || exit 1
trap popd EXIT

set -o xtrace
"$root/bin/kubebuilder" create api \
    --controller \
    --resource \
    --group "$group" \
    --version "$version" \
    --kind "$kind" \
    --plural "$plural"
