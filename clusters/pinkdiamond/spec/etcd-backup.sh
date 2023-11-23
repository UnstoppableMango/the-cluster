#!/bin/bash

root="$(git rev-parse --show-toplevel)/clusters/pinkdiamond"
cwd="$root/spec"

stack="$(pulumi -C "$root" stack --show-name)"
work="$cwd/tmp"
mkdir -p "$work"

export PD_BACKUP_DIR="$work"
mkdir -p "$PD_BACKUP_DIR"

. "$root/scripts/etcd-backup.sh"
retval=$?

echo ""

echo "It should create backup file..."
if [ $retval -eq 0 ] && [ -f "$PD_BACKUP_DIR/etcd-"* ]; then
    echo "✅ Etcd backup created!"
else
    echo "❌ No backup created!"
fi

echo ""

echo "Cleaning up..."
rm -r "$work"
