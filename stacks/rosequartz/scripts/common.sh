#!/bin/bash

if [ -z ${ROSEQUARTZ_STACK+x} ] && [ ${CI+x} ] && [[ "$CI" == "true" || "$CI" == "1" ]]; then
    echo "Setting ROSEQUARTZ_STACK=ci"
    export ROSEQUARTZ_STACK="ci"
fi
