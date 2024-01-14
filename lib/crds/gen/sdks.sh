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
crd2pulumi "${manifests[@]}" \
    --dotnetPath="$dotnetDir" \
    --dotnetName="TheClusterCrds" \
    --nodejsPath="$nodejsDir" \
    --nodejsName "thecluster-crds" \
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
sed -i "s/next-upstream-timeout/'next-upstream-timeout'/" "$nodejsDir/types/input.ts"
sed -i "s/next-upstream-timeout/'next-upstream-timeout'/" "$nodejsDir/types/output.ts"
sed -i "s/next-upstream-tries/'next-upstream-tries'/" "$nodejsDir/types/input.ts"
sed -i "s/next-upstream-tries/'next-upstream-tries'/" "$nodejsDir/types/output.ts"
sed -i "s/next-upstream?/'next-upstream'?/" "$nodejsDir/types/input.ts"
sed -i "s/next-upstream?/'next-upstream'?/" "$nodejsDir/types/output.ts"
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
    echo -ne "\\r\033[2KFixing $1..."
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

echo -e "\nUpdating nodejs lib name..."
packageJson="$(cat "$nodejsDir/package.json")"
echo "$packageJson" | jq '.name = "@unstoppablemango/thecluster-crds" | .version = "0.1.0"' >"$nodejsDir/package.json"
packageJson="$(cat "$nodejsDir/package.json")"
echo "$packageJson" | jq '.repository.type = "git" | .repository.url = "git+https://github.com/UnstoppableMango/the-cluster.git"' >"$nodejsDir/package.json"
echo '@unstoppablemango:registry=https://npm.pkg.github.com' >"$nodejsDir/.npmrc"

function patchDotnet() {
    echo -ne "\\r\033[2KFixing $1..."
    sed -i 's/ x-kubernetes-preserve-unknown-fields/ xKubernetesPreserveUnknownFields/' "$1"
    sed -i 's/ X-kubernetes-preserve-unknown-fields/ XKubernetesPreserveUnknownFields/' "$1"
    sed -i "s/ location-snippets/ locationSnippets/" "$1"
    sed -i "s/ Location-snippets/ LocationSnippets/" "$1"
    sed -i "s/ http-snippets/ httpSnippets/" "$1"
    sed -i "s/ Http-snippets/ HttpSnippets/" "$1"
    sed -i "s/ server-snippets/ serverSnippets/" "$1"
    sed -i "s/ Server-snippets/ ServerSnippets/" "$1"
    sed -i "s/ buffer-size/ bufferSize/" "$1"
    sed -i "s/ Buffer-size/ BufferSize/" "$1"
    sed -i "s/ client-max-body-size/ clientMaxBodySize/" "$1"
    sed -i "s/ Client-max-body-size/ ClientMaxBodySize/" "$1"
    sed -i "s/ connect-timeout/ connectTimeout/" "$1"
    sed -i "s/ Connect-timeout/ ConnectTimeout/" "$1"
    sed -i "s/ fail-timeout/ failTimeout/" "$1"
    sed -i "s/ Fail-timeout/ FailTimeout/" "$1"
    sed -i "s/ lb-method/ lbMethod/" "$1"
    sed -i "s/ Lb-method/ LbMethod/" "$1"
    sed -i "s/ max-conns/ maxConns/" "$1"
    sed -i "s/ Max-conns/ MaxConns/" "$1"
    sed -i "s/ max-fails/ maxFails/" "$1"
    sed -i "s/ Max-fails/ MaxFails/" "$1"
    sed -i "s/ next-upstream-timeout/ nextUpstreamTimeout/" "$1"
    sed -i "s/ Next-upstream-timeout/ NextUpstreamTimeout/" "$1"
    sed -i "s/ next-upstream-tries/ nextUpstreamTries/" "$1"
    sed -i "s/ Next-upstream-tries/ NextUpstreamTries/" "$1"
    sed -i "s/ next-upstream/ nextUpstream/" "$1"
    sed -i "s/ Next-upstream/ NextUpstream/" "$1"
    sed -i "s/ keepalive-time/ keepaliveTime/" "$1"
    sed -i "s/ Keepalive-time/ KeepaliveTime/" "$1"
    sed -i "s/ read-timeout/ readTimeout/" "$1"
    sed -i "s/ Read-timeout/ ReadTimeout/" "$1"
    sed -i "s/ send-timeout/ sendTimeout/" "$1"
    sed -i "s/ Send-timeout/ SendTimeout/" "$1"
    sed -i "s/ slow-start/ slowStart/" "$1"
    sed -i "s/ Slow-start/ SlowStart/" "$1"
    sed -i "s/ use-cluster-ip/ useClusterIp/" "$1"
    sed -i "s/ Use-cluster-ip/ UseClusterIp/" "$1"
    sed -i "s/ cluster-issuer/ clusterIssuer/" "$1"
    sed -i "s/ Cluster-issuer/ ClusterIssuer/" "$1"
    sed -i "s/ cert-manager/ certManager/" "$1"
    sed -i "s/ Cert-manager/ CertManager/" "$1"
    sed -i "s/ common-name/ commonName/" "$1"
    sed -i "s/ Common-name/ CommonName/" "$1"
    sed -i "s/ issue-temp-cert/ issueTempCert/" "$1"
    sed -i "s/ Issue-temp-cert/ IssueTempCert/" "$1"
    sed -i "s/ issuer-group/ issuerGroup/" "$1"
    sed -i "s/ Issuer-group/ IssuerGroup/" "$1"
    sed -i "s/ issuer-kind/ issuerKind/" "$1"
    sed -i "s/ Issuer-kind/ IssuerKind/" "$1"
    sed -i "s/ renew-before/ renewBefore/" "$1"
    sed -i "s/ Renew-before/ RenewBefore/" "$1"
    sed -i "s/ metadata.omitempty/ metadataOmitempty/" "$1"
    sed -i "s/ Metadata.omitempty/ MetadataOmitempty/" "$1"
    sed -i "s/Pulumi.V1/PulumiOperator.V1/" "$1"
}

export -f patchDotnet
echo "Patching .NET lib..." # TODO: This is slow af
find "$dotnetDir" -type f \
    -name '*.cs' \
    \( \
        -path '*ClusterClassSpecVariables*' \
        -o -path '*ClusterClassStatusVariables*' \
        -o -path '*ProxmoxMachineTemplate*' \
        -o -path '*VirtualServerRouteSpec*' \
        -o -path '*VirtualServerSpec*' \
        -o -path '*Pulumi/V1*' \
    \) \
    -not -path '*obj*' \
    -exec bash -c 'patchDotnet "$0"' {} \;

# Make sure the last thing we do is pop back
# trap popd EXIT

echo -e "\nInstalling nodejs packages...\n"
pushd "$nodejsDir"
npm install @pulumi/pulumi@latest @pulumi/kubernetes@latest @types/node@latest typescript@latest
popd

echo -e "Restoring dotnet packages...\n"
pushd "$dotnetDir"
dotnet add "$dotnetDir" package Pulumi
dotnet add "$dotnetDir" package Pulumi.Kubernetes
dotnet restore
popd
