#!/bin/bash
set -eum

if ! command -v talosctl >/dev/null 2>&1; then
    echo "Install talosctl first https://www.talos.dev/v1.5/introduction/quickstart/#talosctl"
    exit 1
fi

if ! command -v pulumi >/dev/null 2>&1; then
    echo "Install pulumi first https://www.pulumi.com/docs/install/"
    exit 1
fi

root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="$(hostname)"

if [ -z "$(pulumi -C "$root" stack ls --json | jq -r ".[].name | select(. == \"$stack\")")" ]; then
    echo "Initializing stack for $stack..."
    pulumi stack init $stack --copy-config-from rosequartz
    pulumi stack tag set bootstrap true
    pulumi config set createDnsRecord false

    # https://askubuntu.com/a/1091002
    LANIFACE=$(ip route get 1.1.1.1 | grep -Po '(?<=dev\s)\w+' | cut -f1 -d ' ')
    LANIP=$(ip addr show "$LANIFACE" | grep "inet " | cut -d '/' -f1 | cut -d ' ' -f6)
    pulumi config set publicIp $LANIP
fi

pulumi stack select $stack

clusterName="$(pulumi -C "$root" config get clusterName)"
k8sVersion="$(pulumi -C "$root" config get --path versions.k8s)"
talosVersion="$(pulumi -C "$root" config get --path versions.talos)"
publicIp="$(pulumi -C "$root" config get publicIp)"
kubeDir="$root/.kube/$stack"
talosDir="$root/.talos/$stack"

mkdir -p "$kubeDir"
mkdir -p "$talosDir"

export KUBECONFIG="$kubeDir/config"
export TALOSCONFIG="$talosDir/config"

if [ -f "$TALOSCONFIG" ] \
&& [ "$publicIp" == "$(talosctl get nodenames -o yaml | yq -r '.node')" ] \
&& [ -f "$KUBECONFIG" ] \
&& kubectl get nodes
then
    echo -e "\nCluster exists, exiting"
    exit 0
fi

# Need to pass talosconfig explicitly for some reason otherwise it uses $HOME/.talos/config
talosctl cluster create \
    --kubernetes-version "$k8sVersion" \
    --talos-version "v$talosVersion" \
    --exposed-ports '69:69/udp,8081:8081/tcp,51821:51821/udp' \
    --controlplanes 1 \
    --workers 0 \
    --memory 4096 \
    --endpoint $publicIp \
    --talosconfig $TALOSCONFIG \
    --name "$clusterName-bootstrap" \
    --config-patch-control-plane \
        "@$root/patches/allowSchedulingOnControlPlanes.yaml"

talosctl config node $publicIp
