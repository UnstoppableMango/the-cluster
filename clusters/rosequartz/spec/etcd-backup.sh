#!/bin/bash

cwd="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
root="$(dirname "$cwd")"

stack="${RQ_STACK:-dev}"
work="$cwd/tmp"
mkdir -p "$work"

export RQ_BACKUP_DIR="$work"
export RQ_TALOS_DIR="$root/.talos/$stack"
export RQ_NODE_IP="10.5.0.2"

mkdir -p "$RQ_BACKUP_DIR"

. "$root/scripts/etcd-backup.sh"
retval=$?

echo ""

echo "It should create backup file..."
if [ $retval -eq 0 ] && [ -f "$RQ_BACKUP_DIR/etcd-"* ]; then
    echo "✅ Etcd backup created!"
else
    echo "❌ No backup created!"
fi

echo ""

echo "Cleaning up..."
rm -r "$work"
