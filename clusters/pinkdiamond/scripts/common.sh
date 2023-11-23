#!/bin/bash

if [ -z ${PD_STACK+x} ] && [ ${CI+x} ] && [[ "$CI" == "true" || "$CI" == "1" ]]; then
    echo "Setting PD_STACK=ci"
    export PD_STACK="ci"
fi
