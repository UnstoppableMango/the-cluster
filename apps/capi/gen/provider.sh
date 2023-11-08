#!/bin/bash
set -em

component=$1
module=$2
version=$3

if [ -z "${component+x}" ]; then
    echo "Component is required in position 1 (e.g. --infrastructure)"
    exit 1
fi

if [ -z "${module+x}" ]; then
    echo "Module is required in position 2 (e.g. talos)"
    exit 1
fi

if [ -z "${version+x}" ]; then
    echo "Version is required in position 3 (e.g. 1.2.3)"
    exit 1
fi

clusterctl generate provider "$component" "$module:v$version" "${@:4}"
