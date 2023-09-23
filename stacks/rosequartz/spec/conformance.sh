#!/bin/bash

set -eu

nodeIp="${ROSEQUARTZ_NODE_IP:-"10.5.0.2"}"

echo "Starting conformance tests..."
talosctl conformance --nodes "$nodeIp"
