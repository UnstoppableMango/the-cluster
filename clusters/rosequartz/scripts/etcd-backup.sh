#!/bin/bash
set -e

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="$(pulumi -C "$root" stack --show-name)"
talosDir="$root/.talos/$stack"
backupDir=${RQ_BACKUP_DIR:-"$talosDir"}

echo "Stack:     $stack"
echo "BackupDir: $backupDir"
echo "Talos Dir: $talosDir"

echo "Creating etcd snapshot..."
backupFile="$backupDir/etcd-$(date +%s).snapshot"
talosctl etcd snapshot "$backupFile" --nodes "$(pulumi -C "$root" config get endpoint)"
