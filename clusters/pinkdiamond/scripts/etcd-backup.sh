#!/bin/bash
set -e

root="$(git rev-parse --show-toplevel)/clusters/pinkdiamond"
stack="$(pulumi -C "$root" stack --show-name)"
talosDir="$root/.config/$stack"
backupDir=${PD_BACKUP_DIR:-"$talosDir"}

echo "Stack:     $stack"
echo "BackupDir: $backupDir"
echo "Talos Dir: $talosDir"

echo "Creating etcd snapshot..."
backupFile="$backupDir/etcd-$(date +%s).snapshot"
talosctl etcd snapshot "$backupFile" --nodes "$(pulumi -C "$root" config get endpoint)"
