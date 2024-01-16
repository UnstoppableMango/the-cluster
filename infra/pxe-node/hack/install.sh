#!/bin/bash
set -eum

sudo virt-install \
    --network network=macvtap-net \
    --pxe \
    --name pxe \
    --memory 2048 \
    --disk size=10 \
    --nographics \
    --boot menu=on,useserial=on \
    --osinfo archlinux
