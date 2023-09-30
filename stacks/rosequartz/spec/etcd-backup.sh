#!/bin/bash

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${ROSEQUARTZ_STACK:-dev}"
work="$cwd/tmp"
mkdir -p "$work"

export ROSEQUARTZ_BACKUP_DIR="$work"
export ROSEQUARTZ_TALOS_DIR="$root/.talos/$stack"
export ROSEQUARTZ_NODE_IP="10.5.0.2"

mkdir -p "$ROSEQUARTZ_BACKUP_DIR"

. "$root/scripts/etcd-backup.sh"
retval=$?

echo ""

echo "It should create backup file..."
if [ $retval -eq 0 ] && [ -f "$ROSEQUARTZ_BACKUP_DIR/etcd-"* ]; then
    echo "✅ Etcd backup created!"
else
    echo "❌ No backup created!"
fi

echo ""

echo "Cleaning up..."
rm -r "$work"
