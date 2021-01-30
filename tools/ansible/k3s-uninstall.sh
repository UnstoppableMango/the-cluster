#!/bin/bash

dir="$(dirname "$0")"

ansible-playbook $dir/playbooks/k3s-uninstall.yml --user erik --ask-become-pass -i $dir/inventory/hosts
