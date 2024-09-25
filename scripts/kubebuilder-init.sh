#!/bin/bash
set -e

root="$(git rev-parse --show-toplevel)"

pushd "$root/operator" || exit 1
trap popd EXIT

"$root/bin/kubebuilder" init \
  --domain thecluster.io \
  --project-name thecluster \
  --owner UnstoppableMango \
  --repo github.com/unstoppablemango/the-cluster/operator
