./scripts/destroy-cluster.sh
pulumi destroy -yf
rm controlplane.yaml worker.yaml
