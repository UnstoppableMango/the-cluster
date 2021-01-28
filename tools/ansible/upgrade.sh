#!/bin/bash
ansible-playbook ./playbooks/apt.yml --user erik --ask-become-pass -i ./inventory/hosts
