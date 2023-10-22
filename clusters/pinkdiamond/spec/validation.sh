#!/bin/bash
set -eu

exitCode=0
root="$(git rev-parse --show-toplevel)/stacks/pinkdiamond"

echo -e "Running Pink Diamond tests\n"

if ! $root/spec/manifest-validation.sh; then
    exitCode=1
fi

if ! $root/spec/infra-validation.sh; then
    exitCode=1
fi

exit $exitCode
