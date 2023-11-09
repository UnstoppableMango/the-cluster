#!/bin/bash
set -eum

sudo virsh destroy pxe
sudo virsh undefine pxe
