#!/bin/bash

if [ -z ${RQ_STACK+x} ] && [ ${CI+x} ] && [[ "$CI" == "true" || "$CI" == "1" ]]; then
    echo "Setting RQ_STACK=ci"
    export RQ_STACK="ci"
fi
