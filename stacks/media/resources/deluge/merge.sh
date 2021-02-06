#!/bin/sh
cat <<< $(jq -s ".[1] * .[2]" ./config/core.conf ./override/core.conf) >> ./override/base.conf
cp ./override/base.conf ./config/core.conf
