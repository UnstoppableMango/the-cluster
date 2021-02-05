#!/bin/bash
VERSION="9.14.2"

if [ ! -z "$1" ]; then
  VERSION=$1
fi

# https://stackoverflow.com/a/65411733/7341217
# Create if not extists
kubectl create namespace traefik-system --dry-run=client -o yaml | kubectl apply -f -

helm repo add traefik https://helm.traefik.io/traefik
helm repo update

helm install \
  traefik traefik/traefik \
  --namespace traefik-system \
  --version v$VERSION \
  --set logs.general.level="DEBUG" \
  --set pilot.enabled=true \
  --set pilot.token=$(pulumi config get --path traefik.pilot.token -C ../stacks/networking) \
  --set "ports.web.redirectTo=websecure" \
  --set "ports.websecure.tls.enabled=true" \
  # --set "volumes[0].name=default-tls-cert" \
  # --set "volumes[0].mountPath=/certs" \
  # --set "volumes[0].type=secret" \
