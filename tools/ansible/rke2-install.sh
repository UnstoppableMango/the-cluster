#!/bin/bash
ansible-playbook ./playbooks/rke2-install.yml --user erik --ask-become-pass -i ./inventory/hosts
