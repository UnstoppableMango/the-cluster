#!/bin/bash

set -e

while read resource; do
    terraform state rm "$resource"
done <<< "$(terraform state list)"
