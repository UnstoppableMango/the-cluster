#!/bin/bash
set -eum

sudo virt-install \
    --network bridge:vmbr0 \
    --pxe \
    --name pxe \
    --memory 2048 \
    --disk size=10 \
    --nographics \
    --boot menu=on,useserial=on \
    --osinfo archlinux
