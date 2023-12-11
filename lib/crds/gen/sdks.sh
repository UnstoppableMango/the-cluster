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

echo "Generating crds libs..."
# crd2pulumi "$crdsDir"/*.yaml \
#     --dotnetPath="$dotnetDir" \
#     --goPath="$goDir" \
#     --nodejsPath="$nodejsDir" \
#     --pythonPath="$pythonDir" \
#     --force
crd2pulumi "$crdsDir"/*.yaml \
    --nodejsPath="$nodejsDir" \
    --force

echo "Patching nodejs lib..."
sed -i '' "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$nodejsDir/types/input.ts"
sed -i '' "s/x-kubernetes-preserve-unknown-fields/'x-kubernetes-preserve-unknown-fields'/" "$nodejsDir/types/output.ts"
sed -i '' "s/metadata.omitempty/'metadata.omitempty'/" "$nodejsDir/types/input.ts"
sed -i '' "s/metadata.omitempty/'metadata.omitempty'/" "$nodejsDir/types/output.ts"

function renamePulumi() {
    echo "Fixing $1..."
    sed -i '' 's/namespace pulumi/namespace pulumiOperator/' "$1"
    sed -i '' 's/pulumi.v1/pulumiOperator.v1/' "$1"
    sed -i '' 's/pulumi from ".\/pulumi"/pulumiOperator from ".\/pulumi"/' "$1"
    sed -i '' 's/pulumi,/pulumiOperator,/' "$1"
}

export -f renamePulumi
# find "$nodejsDir/pulumi" -type f -exec bash -c 'renamePulumi "$0"' {} \;
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

# echo -e "Restoring dotnet packages...\n"
# pushd "$dotnetDir"
# dotnet restore
# popd
