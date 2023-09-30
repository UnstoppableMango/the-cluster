#!/bin/bash

set -e

terraform workspace select rosequartz-ci

while read resource; do
    terraform state rm "$resource"
done <<< "$(terraform state list)"
