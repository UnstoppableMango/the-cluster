#!/bin/bash

set -eu

if [ -z ${ROSEQUARTZ_CLUSTER_DESTROY+x} ] || [ "$ROSEQUARTZ_CLUSTER_DESTROY" = "true" ]; then
    talosctl cluster destroy
fi
