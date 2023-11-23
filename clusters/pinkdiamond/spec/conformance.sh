#!/bin/bash

set -eu

nodeIp="${PD_NODE_IP:-"10.6.0.2"}"

echo "Starting conformance tests..."
talosctl conformance --nodes "$nodeIp"
