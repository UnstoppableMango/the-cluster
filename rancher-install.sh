#!/bin/bash
helm install rancher rancher-latest/rancher \
    --namespace cattle-system \
    --set hostname=rancher.int.unmango.net \
    # --set tls=external \
    # --set ingress.tls.source=letsEncrypt \
    # --set letsEncrypt.email=ecr.referee@hotmail.com

kubectl -n cattle-system rollout status deploy/rancher
