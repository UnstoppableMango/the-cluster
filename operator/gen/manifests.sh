#!/usr/bin/env bash
set -eum

root="$(git rev-parse --show-toplevel)"
name="thecluster"

dotnet kubeops generate operator "$name" \
  "$root/operator/UnMango.TheCluster.Entities/UnMango.TheCluster.Entities.csproj" \
  --out "$root/operator/bases"

rm "$root/operator/bases/Dockerfile"
