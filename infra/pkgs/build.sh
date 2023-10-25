#!/bin/bash
set -eu

# Extracted from running `make PLATFORM=linux/arm64,linux/amd64 USERNAME=unstoppablemango TARGETS=raspberrypi4-uefi`
# https://github.com/siderolabs/pkgs/blob/v1.6.0-alpha.0/Makefile

root="$(git rev-parse --show-toplevel)/infra/pkgs"
tag="$(git describe --tag --always --dirty)"

# --build-arg=http_proxy=$(http_proxy) \
# --build-arg=https_proxy=$(https_proxy) \
# --build-arg=SOURCE_DATE_EPOCH=$(SOURCE_DATE_EPOCH) \

docker buildx build \
    --target=raspberrypi4-uefi \
    --file="$root/Pkgfile" \
    --provenance=false \
    --progress=auto \
    --platform=linux/arm64,linux/amd64 \
    --tag=ghcr.io/unstoppablemango/raspberrypi4-uefi:"$tag" \
    "$root"
