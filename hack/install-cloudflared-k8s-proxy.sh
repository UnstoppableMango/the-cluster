#!/usr/bin/env bash
set -ex

UNIT_NAME=cloudflared-k8s-proxy.service
UNIT_SRC="$(dirname "$0")/$UNIT_NAME"
UNIT_DST="$HOME/.config/systemd/user/$UNIT_NAME"

mkdir -p "$(dirname "$UNIT_DST")"
cp "$UNIT_SRC" "$UNIT_DST"

systemctl --user daemon-reload
systemctl --user enable --now "$UNIT_NAME"

echo "Proxy running on localhost:16443"
echo "Authenticate with: cloudflared access login k8s.thecluster.io"
