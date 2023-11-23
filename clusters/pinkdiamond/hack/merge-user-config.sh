#!/bin/bash
set -eum

if ! command -v kubectl-konfig >/dev/null; then
    echo "Install kubectl-konfig first"
    exit 0
fi

root="$(git rev-parse --show-toplevel)/clusters/pinkdiamond"

read -p "Use stack: $(pulumi -C "$root" stack --show-name)? [y/n] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborting"
    exit 0
fi

echo "Importing kubeconfig..." # TODO: This might delete ~/.kube/config
pulumi -C "$root" stack output --show-secrets kubeconfig \
    | kubectl konfig import -s -i

echo "Writing talosconfig..."
talosconfig="$(mktemp)"
pulumi -C "$root" stack output --show-secrets talosconfig > "$talosconfig"

unset TALOSCONFIG
talosctl config merge "$talosconfig"
