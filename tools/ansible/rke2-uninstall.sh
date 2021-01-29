#!/bin/bash

dir="$(dirname "$0")"

ansible-playbook $dir/playbooks/rke2-uninstall.yml --user erik --ask-become-pass -i $dir/inventory/hosts
