#!/bin/bash
ansible-playbook ./playbooks/rke2-uninstall.yml --user erik --ask-become-pass -i ./inventory/hosts
