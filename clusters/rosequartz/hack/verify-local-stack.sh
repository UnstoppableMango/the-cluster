#!/bin/bash
set -eum

if ! command -v pulumi >/dev/null 2>&1; then
    echo "Install pulumi first https://www.pulumi.com/docs/install/"
    exit 1
fi

name="$(hostname)"


