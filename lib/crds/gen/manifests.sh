#!/bin/bash
set -eum

trap popd EXIT
root="$(git rev-parse --show-toplevel)/lib/crds"
pushd "$root/scripts"
npm run patch
