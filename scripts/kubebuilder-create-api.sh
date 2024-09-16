#!/bin/bash

read -r -p 'Version: ' version
read -r -p 'Kind: ' kind
read -r -p 'Plural: ' plural

set -o xtrace
kubebuilder create api \
    --controller \
    --resource \
    --group thecluster \
    --version "$version" \
    --kind "$kind" \
    --plural "$plural"
