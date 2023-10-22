#!/bin/bash

set -e

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${RQ_STACK:-dev}"
backupDir=$RQ_BACKUP_DIR
talosDir="${RQ_TALOS_DIR:-"$root/.talos/$stack"}"

echo "Stack:     $stack"
echo "BackupDir: $backupDir"
echo "Talos Dir: $talosDir"

echo "Creating etcd snapshot..."
backupFile="${backupDir:-$talosDir}/etcd-$(date +%s).snapshot"
talosctl etcd snapshot "$backupFile"
