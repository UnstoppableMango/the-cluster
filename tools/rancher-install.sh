#!/bin/bash
helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
helm repo update

# https://stackoverflow.com/a/65411733/7341217
# Create if not extists
kubectl create namespace cattle-system --dry-run=client -o yaml | kubectl apply -f -

helm install rancher rancher-latest/rancher \
    --namespace cattle-system \
    --set hostname=rancher.int.unmango.net \
    --set tls=external \
    # --set ingress.tls.source=letsEncrypt \
    # --set letsEncrypt.email=ecr.referee@hotmail.com

kubectl -n cattle-system rollout status deploy/rancher
