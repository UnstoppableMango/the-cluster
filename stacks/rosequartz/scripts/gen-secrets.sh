#!/bin/bash

set -eu

if [ -z ${ROSEQUARTZ_SECRETS_FILE+x} ]; then
    echo "Secrets must be provided"
    exit 1
fi

if [ -z ${ROSEQUARTZ_TALOS_VERSION+x} ]; then
    echo "Endpoint must be provided"
    exit 1
fi

DIR=$(dirname "$ROSEQUARTZ_SECRETS_FILE")
FILE="$ROSEQUARTZ_SECRETS_FILE"
TALOS_VERSION="v$ROSEQUARTZ_TALOS_VERSION"

mkdir -p "$DIR"

talosctl gen secrets \
    --talos-version "$TALOS_VERSION" \
    --output-file "$FILE"

cat "$FILE"
