#!/usr/bin/env bash
set -e

: "${KUBECTL:=kubectl}"
: "${SERVER:=https://k8s.thecluster.io}"

token=$("$KUBECTL" get secret cluster-admin-public-token \
  -n kube-system \
  -o jsonpath='{.data.token}' | base64 -d)

cat <<EOF
apiVersion: v1
clusters:
- cluster:
    server: ${SERVER}
  name: pinkdiamond
contexts:
- context:
    cluster: pinkdiamond
    user: admin
  name: pinkdiamond
current-context: pinkdiamond
kind: Config
users:
- name: admin
  user:
    token: ${token}
EOF
