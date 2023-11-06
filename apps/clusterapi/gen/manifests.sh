#!/bin/bash
set -em

if ! command -v clusterctl >/dev/null 2>&1; then
    echo "Install clusterctl first https://cluster-api.sigs.k8s.io/user/quick-start#install-clusterctl"
    exit 1
fi

if ! command -v pulumi >/dev/null 2>&1; then
    echo "Install pulumi first https://www.pulumi.com/docs/install/"
    exit 1
fi

if ! command -v kubectl-slice >/dev/null 2>&1; then
    echo "Install kubectl-slice first https://github.com/patrickdappollonio/kubectl-slice#installation"
    exit 1
fi

if [ -z "${GITHUB_TOKEN+x}" ]; then
    echo "It is recommended to set GITHUB_TOKEN to avoid rate limiting"
    echo "https://cluster-api.sigs.k8s.io/clusterctl/overview.html#avoiding-github-rate-limiting"
fi

root="$(git rev-parse --show-toplevel)/apps/clusterapi"
stack="$(pulumi -C "$root" stack --show-name)"
manifestDir="$root/manifests/$stack"

function version() {
    dep=$1
    pulumi -C "$root" config get --path "versions.$dep"
}

coreVersion="$(version "clusterapi")"
proxmoxVersion="$(version "proxmox")"
sideroVersion="$(version "sidero")"
cabptVersion="$(version "cabpt")"
cacpptVersion="$(version "cacppt")"

[ -d "$manifestDir" ] && rm -r "$manifestDir"
mkdir -p "$manifestDir"

function gen() {
    component=$1
    module=$2
    version=$3
    config="--config $root/clusterctl.yaml"
    providerName="${module}${component:1}"

    echo "Generating CRDs for $module $version"
    mkdir -p "$manifestDir/$providerName"
    "$root/gen/provider.sh" $component $module $version $config \
        | kubectl slice --exclude-kind CustomResourceDefinition --stdout \
        > "$manifestDir/$providerName/output.yaml"
}

export SIDERO_CONTROLLER_MANAGER_HOST_NETWORK=true
export SIDERO_CONTROLLER_MANAGER_DEPLOYMENT_STRATEGY=Recreate
export SIDERO_CONTROLLER_MANAGER_API_ENDPOINT="$(pulumi -C "$root" config get sideroApiEndpoint)"
export SIDERO_CONTROLLER_MANAGER_AUTO_BMC_SETUP=false

gen --core "cluster-api" $coreVersion
gen --bootstrap "talos" $cabptVersion
gen --control-plane "talos" $cacpptVersion
gen --infrastructure "sidero" $sideroVersion
gen --infrastructure "proxmox" $proxmoxVersion
