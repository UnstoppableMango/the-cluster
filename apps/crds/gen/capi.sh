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

repoRoot="$(git rev-parse --show-toplevel)"
root="$repoRoot/apps/crds"
manifestDir="$root/manifests"

echo "Selecting codegen stack..."
oldStack="$(pulumi -C "$root" stack --show-name)"
pulumi -C "$root" stack select codegen

function version() {
    dep=$1
    pulumi -C "$root" config get --path "$dep.version"
}

echo "Getting versions..."
coreVersion="$(version "clusterapi")"
proxmoxVersion="$(version "proxmox")"
sideroVersion="$(version "sidero")"
cabptVersion="$(version "cabpt")"
cacpptVersion="$(version "cacppt")"

function gen() {
    component=$1
    module=$2
    version=$3
    config="--config $root/clusterctl.yaml"
    providerName="${module}${component:1}"
    mkdir -p "$manifestDir/$providerName"

    echo "Generating CRDs for $module $version"
    "$repoRoot/apps/clusterapi/gen/provider.sh" $component $module $version $config \
        | kubectl slice --include-kind CustomResourceDefinition --stdout \
        > "$manifestDir/$providerName/generated.yaml"

    echo "Building kustomizations..."
    kustomize build "$manifestDir/$providerName" \
        > "$manifestDir/$providerName/output.yaml"
}

"$root/gen/clusterctl-config.sh"

gen --core "cluster-api" $coreVersion
gen --bootstrap "talos" $cabptVersion
gen --control-plane "talos" $cacpptVersion
gen --infrastructure "sidero" $sideroVersion
gen --infrastructure "proxmox" $proxmoxVersion

echo "Switching back to stack $oldStack..."
pulumi -C "$root" stack select "$oldStack"
