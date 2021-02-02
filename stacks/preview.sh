#!/bin/bash
stacks="$(dirname "$0")/*/"
for dir in $stacks
do
    echo Previewing $dir
    pulumi preview -C $dir
done
