#!/bin/bash
set -eum

if ! command -v crd2pulumi >/dev/null 2>&1; then
    echo "Install crd2pulumi first https://github.com/pulumi/crd2pulumi#building-and-installation"
    exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "Install npm first"
    exit 0
fi

if ! command -v dotnet >/dev/null 2>&1; then
    echo "Install dotnet first"
    exit 0
fi

root="$(git rev-parse --show-toplevel)"
libDir="$root/lib/crds"
crdsDir="$libDir/manifests"
dotnetDir="$libDir/dotnet"
goDir="$libDir/go"
javaDir="$libDir/java"
nodejsDir="$libDir/nodejs"
pythonDir="$libDir/python"

echo "Cleaning lib directories..."
[ -d "$dotnetDir" ] && rm -r "$dotnetDir"
[ -d "$goDir" ] && rm -r "$goDir"
[ -d "$libDir/kubernetes" ] && rm -r "$libDir/kubernetes" # Also go dir I guess?
[ -d "$javaDir" ] && rm -r "$javaDir"
[ -d "$nodejsDir" ] && rm -r "$nodejsDir"
[ -d "$pythonDir" ] && rm -r "$pythonDir"

mapfile -t manifests < <(find "$crdsDir"/* ! -name '*summerwind*')
echo "Generating crds libs..."
# crd2pulumi "$crdsDir"/*.yaml \
#     --dotnetPath="$dotnetDir" \
#     --goPath="$goDir" \
#     --nodejsPath="$nodejsDir" \
#     --pythonPath="$pythonDir" \
#     --force
crd2pulumi "${manifests[@]}" \
    --dotnetPath="$dotnetDir" \
    --dotnetName="TheCluster.Crds" \
    --nodejsPath="$nodejsDir" \
    --nodejsName "thecluster-crds" \
    --pythonPath="$pythonDir" \
    --force

echo "Patching nodejs lib..."
sed -i "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$nodejsDir/types/input.ts"
sed -i "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$nodejsDir/types/output.ts"
sed -i "s/location-snippets/'location-snippets'/" "$nodejsDir/types/input.ts"
sed -i "s/location-snippets/'location-snippets'/" "$nodejsDir/types/output.ts"
sed -i "s/http-snippets/'http-snippets'/" "$nodejsDir/types/input.ts"
sed -i "s/http-snippets/'http-snippets'/" "$nodejsDir/types/output.ts"
sed -i "s/server-snippets/'server-snippets'/" "$nodejsDir/types/input.ts"
sed -i "s/server-snippets/'server-snippets'/" "$nodejsDir/types/output.ts"
sed -i "s/buffer-size/'buffer-size'/" "$nodejsDir/types/input.ts"
sed -i "s/buffer-size/'buffer-size'/" "$nodejsDir/types/output.ts"
sed -i "s/client-max-body-size/'client-max-body-size'/" "$nodejsDir/types/input.ts"
sed -i "s/client-max-body-size/'client-max-body-size'/" "$nodejsDir/types/output.ts"
sed -i "s/connect-timeout/'connect-timeout'/" "$nodejsDir/types/input.ts"
sed -i "s/connect-timeout/'connect-timeout'/" "$nodejsDir/types/output.ts"
sed -i "s/fail-timeout/'fail-timeout'/" "$nodejsDir/types/input.ts"
sed -i "s/fail-timeout/'fail-timeout'/" "$nodejsDir/types/output.ts"
sed -i "s/lb-method/'lb-method'/" "$nodejsDir/types/input.ts"
sed -i "s/lb-method/'lb-method'/" "$nodejsDir/types/output.ts"
sed -i "s/max-conns/'max-conns'/" "$nodejsDir/types/input.ts"
sed -i "s/max-conns/'max-conns'/" "$nodejsDir/types/output.ts"
sed -i "s/max-fails/'max-fails'/" "$nodejsDir/types/input.ts"
sed -i "s/max-fails/'max-fails'/" "$nodejsDir/types/output.ts"
sed -i "s/next-upstream?/'next-upstream'?/" "$nodejsDir/types/input.ts"
sed -i "s/next-upstream?/'next-upstream'?/" "$nodejsDir/types/output.ts"
sed -i "s/next-upstream-timeout/'next-upstream-timeout'/" "$nodejsDir/types/input.ts"
sed -i "s/next-upstream-timeout/'next-upstream-timeout'/" "$nodejsDir/types/output.ts"
sed -i "s/next-upstream-tries/'next-upstream-tries'/" "$nodejsDir/types/input.ts"
sed -i "s/next-upstream-tries/'next-upstream-tries'/" "$nodejsDir/types/output.ts"
sed -i "s/keepalive-time/'keepalive-time'/" "$nodejsDir/types/input.ts"
sed -i "s/keepalive-time/'keepalive-time'/" "$nodejsDir/types/output.ts"
sed -i "s/read-timeout/'read-timeout'/" "$nodejsDir/types/input.ts"
sed -i "s/read-timeout/'read-timeout'/" "$nodejsDir/types/output.ts"
sed -i "s/send-timeout/'send-timeout'/" "$nodejsDir/types/input.ts"
sed -i "s/send-timeout/'send-timeout'/" "$nodejsDir/types/output.ts"
sed -i "s/slow-start/'slow-start'/" "$nodejsDir/types/input.ts"
sed -i "s/slow-start/'slow-start'/" "$nodejsDir/types/output.ts"
sed -i "s/use-cluster-ip/'use-cluster-ip'/" "$nodejsDir/types/input.ts"
sed -i "s/use-cluster-ip/'use-cluster-ip'/" "$nodejsDir/types/output.ts"
sed -i "s/cluster-issuer/'cluster-issuer'/" "$nodejsDir/types/input.ts"
sed -i "s/cluster-issuer/'cluster-issuer'/" "$nodejsDir/types/output.ts"
sed -i "s/cert-manager/'cert-manager'/" "$nodejsDir/types/input.ts"
sed -i "s/cert-manager/'cert-manager'/" "$nodejsDir/types/output.ts"
sed -i "s/common-name/'common-name'/" "$nodejsDir/types/input.ts"
sed -i "s/common-name/'common-name'/" "$nodejsDir/types/output.ts"
sed -i "s/issue-temp-cert/'issue-temp-cert'/" "$nodejsDir/types/input.ts"
sed -i "s/issue-temp-cert/'issue-temp-cert'/" "$nodejsDir/types/output.ts"
sed -i "s/issuer-group/'issuer-group'/" "$nodejsDir/types/input.ts"
sed -i "s/issuer-group/'issuer-group'/" "$nodejsDir/types/output.ts"
sed -i "s/issuer-kind/'issuer-kind'/" "$nodejsDir/types/input.ts"
sed -i "s/issuer-kind/'issuer-kind'/" "$nodejsDir/types/output.ts"
sed -i "s/renew-before/'renew-before'/" "$nodejsDir/types/input.ts"
sed -i "s/renew-before/'renew-before'/" "$nodejsDir/types/output.ts"
sed -i "s/metadata.omitempty/'metadata.omitempty'/" "$nodejsDir/types/input.ts"
sed -i "s/metadata.omitempty/'metadata.omitempty'/" "$nodejsDir/types/output.ts"

function renamePulumi() {
    echo "Fixing $1..."
    sed -i 's/namespace pulumi/namespace pulumiOperator/' "$1"
    sed -i 's/pulumi.v1/pulumiOperator.v1/' "$1"
    sed -i 's/pulumi from ".\/pulumi"/pulumiOperator from ".\/pulumi"/' "$1"
    sed -i 's/pulumi,/pulumiOperator,/' "$1"
}

export -f renamePulumi
find "$nodejsDir/pulumi" -type f -exec bash -c 'renamePulumi "$0"' {} \;
renamePulumi "$nodejsDir/types/input.ts"
renamePulumi "$nodejsDir/types/output.ts"
renamePulumi "$nodejsDir/index.ts"

echo "Updating nodejs lib name..."
packageJson="$(cat "$nodejsDir/package.json")"
echo "$packageJson" | jq '.name = "@unmango/thecluster-crds" | .version = "0.1.0"' >"$nodejsDir/package.json"

# Make sure the last thing we do is pop back
# trap popd EXIT

echo -e "Installing nodejs packages...\n"
pushd "$nodejsDir"
npm install @pulumi/pulumi@latest @pulumi/kubernetes@latest @types/node@latest typescript@latest
popd

echo -e "Restoring dotnet packages...\n"
pushd "$dotnetDir"
dotnet add "$dotnetDir" package Pulumi
dotnet restore
popd
