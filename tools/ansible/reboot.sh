#!/bin/bash
ansible-playbook ./playbooks/reboot.yml --user erik --ask-become-pass -i ./inventory/hosts
