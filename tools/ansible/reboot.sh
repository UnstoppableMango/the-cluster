#!/bin/bash

dir="$(dirname "$0")"

ansible-playbook $dir/playbooks/reboot.yml --user erik --ask-become-pass -i $dir/inventory/hosts
