#!/bin/bash
VERSION="2.3.0"

if [ ! -z "$1" ]; then
  VERSION=$1
fi

# https://stackoverflow.com/a/65411733/7341217
# Create if not extists
kubectl create namespace metallb-system --dry-run=client -o yaml | kubectl apply -f -

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

CONFIG=$(<./metallb/config.yaml)

helm install \
  metallb bitnami/metallb \
  --namespace metallb-system \
  --version v$VERSION \
  --set configInline="$CONFIG"
