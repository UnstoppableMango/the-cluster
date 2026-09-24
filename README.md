# THECLUSTER

[![Hercules CI](https://hercules-ci.com/api/v1/site/github/account/UnstoppableMango/project/the-cluster/badge)](https://hercules-ci.com/github/UnstoppableMango/the-cluster)

UnstoppableMango's homelab infrastructure.
Built on [Kubernetes](https://kubernetes.io) and deployed with [Flux](https://fluxcd.io).

## Repository Structure

```shell
github.com/UnstoppableMango/the-cluster
├── apps                # Application manifests
├── assets              # Assorted images and documents
├── charts              # Haphazard Helm charts
├── clusters            # Cluster entry points (Flux bootstrap Kustomizations)
├── hack                # Boilerplate, scripts, development tooling
├── infrastructure      # Infrastructure manifests
│   ├── configs         # Per-controller config (certs, DNS, storage, ingress)
│   └── controllers     # Controller installs (cert-manager, CNPGs, Crossplane, etc.)
└── nix                 # Nix build/validation packages for this flake
```

See [`charts/README.md`](charts/README.md) for the chart index.
