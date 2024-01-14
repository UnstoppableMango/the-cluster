#!/bin/bash
set -eum

if [ -z "${DOCKER_SENTINEL+x}" ]; then
  echo "These tests are intended to be run by building the \`test\` stage of the Dockerfile"
  echo "If you need to run on your machine and accept the consequences, use:"
  echo "DOCKER_SENTINEL=1 ./e2e.sh"
  exit 1
fi

echo "Hi there we're running tests now"
./UnMango.TheCluster.CLI
