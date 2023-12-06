#!/bin/bash
set -eu

function check-tools() {
    res=0
    if ! command -v terraform 1>/dev/null; then
        echo "'terraform' needs to be installed!"
        res=1
    fi

    if ! command -v docker 1>/dev/null; then
        echo "'docker' needs to be installed!"
        res=1
    fi

    if ! command -v talosctl 1>/dev/null; then
        echo "'talosctl' needs to be installed!"
        res=1
    fi

    if ! command -v pulumi 1>/dev/null; then
        echo "'pulumi' needs to be installed!"
        res=1
    fi

    [ "$res" -gt 0 ] && return 1
    
    echo "Tools are installed!"
}

function start-rosequartz() {
    pushd $root/stacks/rosequartz/
    terraform init

    echo "Select the stack to use"
    options=("dev" "prod")
    select_option "${options[@]}"
    stack=${options[$?]}

    terraform workspace select "rosequartz-$stack"
    ./hack/up.sh
    popd
}

function deploy-cert-manager() {
    # "$root/clusters/cert-manager"
    echo "TODO"
}

check-tools

export CLOUDFLARE_API_TOKEN="test-token"
export RQ_STACK="dev"

root="$(git rev-parse --show-toplevel)"
echo "root: $root"

source $root/scripts/util/select-option.sh

start-rosequartz
deploy-cert-manager
