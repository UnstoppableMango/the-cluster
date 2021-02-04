#!/bin/bash
VERSION="9.14.2"

if [ ! -z "$1" ]; then
  VERSION=$1
fi

# kubectl apply --validate=false \
#     -f https://github.com/jetstack/cert-manager/releases/download/v$VERSION/cert-manager.crds.yaml

# https://stackoverflow.com/a/65411733/7341217
# Create if not extists
# kubectl create namespace cert-manager --dry-run=client -o yaml | kubectl apply -f -

helm repo add traefik https://helm.traefik.io/traefik

# Update your local Helm chart repository cache
helm repo update

helm install \
  traefik traefik/traefik \
  --version v$VERSION \
  --set logs.general.level="DEBUG" \
  --set pilot.enabled=true \
  --set pilot.token=$(pulumi config get --path traefik.pilot.token -C ../stacks/networking) \
