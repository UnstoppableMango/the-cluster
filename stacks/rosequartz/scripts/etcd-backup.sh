#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${ROSEQUARTZ_STACK:-dev}"
backupDir=$ROSEQUARTZ_BACKUP_DIR
talosDir="${ROSEQUARTZ_TALOS_DIR:-"$root/.talos/$stack"}"
nodeIp="${ROSEQUARTZ_NODE_IP:-"10.5.0.2"}"

echo "Creating etcd snapshot..."
backupFile="${backupDir:-$talosDir}/etcd-$(date +%s).snapshot"
talosctl etcd snapshot "$backupFile" \
    --nodes "$nodeIp"
