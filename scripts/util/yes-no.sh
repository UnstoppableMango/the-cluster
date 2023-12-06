#!/bin/bash

# Example usage:
#
# ```shell
# source scripts/util/yes-no.sh
# yesNo "Continue?"
# ```

function yesNo() {
    read -p "$1 [y/n] " -n 1 -r && echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborting"
        exit 0
    fi
}
