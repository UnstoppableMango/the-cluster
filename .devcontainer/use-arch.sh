#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/.devcontainer"

cat > "$root/docker-compose.override.yaml"<< EOF
version: '3'
services: {}
EOF
