#!/bin/bash

dir="$(dirname "$0")"

ansible-playbook $dir/playbooks/apt.yml --user erik --ask-become-pass -i $dir/inventory/hosts
