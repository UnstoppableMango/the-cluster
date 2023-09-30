#!/bin/bash

set -e

export HOST_IP="192.168.1.69"

talosctl cluster create \
  --name sidero-demo \
  -p 67:67/udp,69:69/udp,8081:8081/tcp,51821:51821/udp \
  --workers 0 \
  --config-patch '[{"op": "add", "path": "/cluster/allowSchedulingOnControlPlanes", "value": true}]' \
  --endpoint $HOST_IP
