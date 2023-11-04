#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
. "$root/hack/up.sh"
pulumi -C "$root" up -yf
. "$root/hack/write-config-files.sh"
talosctl health --nodes "$(pulumi -C "$root" config get endpoint)"
bash "$root/spec/verify.sh"
. "$root/spec/etcd-backup.sh"
RQ_DRY_RUN=true bash "$root/scripts/k8s-upgrade.sh"
pulumi -C "$root" down -yf
. "$root/hack/down.sh"
