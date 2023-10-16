#!/bin/bash

echo "Cleaning up $(terraform workspace show)"

while read resource; do
    terraform state rm "$resource"
done <<< "$(terraform state list)"
