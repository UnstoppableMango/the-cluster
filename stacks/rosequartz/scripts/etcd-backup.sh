#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${ROSEQUARTZ_STACK:-dev}"
backupDir=$ROSEQUARTZ_BACKUP_DIR
talosDir="${ROSEQUARTZ_TALOS_DIR:-"$root/.talos/$stack"}"

echo "Stack:     $stack"
echo "BackupDir: $backupDir"
echo "Talos Dir: $talosDir"

echo "Creating etcd snapshot..."
backupFile="${backupDir:-$talosDir}/etcd-$(date +%s).snapshot"
talosctl etcd snapshot "$backupFile"
