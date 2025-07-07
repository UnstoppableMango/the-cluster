# THECLUSTER

UnstoppableMango's homelab infrastructure.
Built on [Kubernetes](https://kubernetes.io) with [Pulumi](https://www.pulumi.com/product/infrastructure-as-code/).

## Repository Structure

```shell
github.com/UnstoppableMango/the-cluster
├── apps              # Application Pulumi stacks
├── assets            # Assorted images and documents
├── charts            # Haphazard Helm charts
├── clusters          # Cluster bootstrapping Pulumi stacks
├── components        # Pulumi component packages
├── crds              # crd2pulumi nodejs output
├── hack              # Boilerplate, scripts, development tooling
├── infra             # Infrastructure Pulumi stacks
├── lib               # Shared code exposed as `npm` packages
│   ├── crds          # Custom Resource Definition codegen
│   │   └── nodejs    # Legacy crd2pulumi output for node
│   └── nodejs        # Shared code for node
└── .versions         # Ad-hoc version pinning
```
