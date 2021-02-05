#!/bin/bash
VERSION="1.1.0"

if [ ! -z "$1" ]; then
  VERSION=$1
fi

# kubectl apply --validate=false \
#     -f https://github.com/jetstack/cert-manager/releases/download/v$VERSION/cert-manager.crds.yaml

# https://stackoverflow.com/a/65411733/7341217
# Create if not extists
kubectl create namespace cert-manager --dry-run=client -o yaml | kubectl apply -f -

# Add the Jetstack Helm repository
helm repo add jetstack https://charts.jetstack.io

# Update your local Helm chart repository cache
helm repo update

helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v$VERSION \
  --set installCRDs=true
