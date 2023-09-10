#!/bin/bash
DIR=$(dirname "$0")
docker build $DIR \
    --file $DIR/index-publisher/Dockerfile \
    --tag index-publisher:dev \
