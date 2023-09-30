#!/bin/bash

set -eu

if [ -z ${THECLUSTER_HEAD_REF+x} ]; then
    echo "THECLUSTER_HEAD_REF must be supplied"
    exit 1
fi

if [ -z ${THECLUSTER_EVENT_NAME+x} ]; then
    echo "THECLUSTER_EVENT_NAME must be supplied"
    exit 1
fi

workspace="rosequartz"
if [ "$THECLUSTER_EVENT_NAME" == "push" ]; then
    workspace="$workspace-prod"
else
    workspace="$workspace-$THECLUSTER_HEAD_REF"
    terraform workspace new "$workspace"
    terraform workspace select "$workspace"
fi

echo "workspace=$workspace" >> "$GITHUB_OUTPUT"
