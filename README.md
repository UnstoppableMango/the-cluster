# THECLUSTER

UnstoppableMango's homelab infrastructure.
Built on [Kubernetes](https://kubernetes.io) with [Pulumi](https://www.pulumi.com/product/infrastructure-as-code/).

## Repository Structure

```shell
github.com/UnstoppableMango/the-cluster
├── apps              # Application Pulumi stacks
├── charts            # Haphazard Helm charts
├── clusters          # Cluster bootstrapping Pulumi stacks
├── containers        # Haphazard Docker containers
├── dbs               # Database Pulumi stacks
├── hack              # Boilerplate, scripts, development tooling
├── infra             # Infrastructure Pulumi stacks
├── lib               # Shared code exposed as `npm` packages
│   ├── components    # Pulumi component packages
│   ├── crds          # Custom Resource Definition codegen
│   │   ├── <lang>    # crd2pulumi output for <lang>
│   │   ├── manifests # CRD codegen input manifests
│   │   └── scripts   # Codegen scripts
│   └── <lang>        # Packages for <lang>
├── scripts           # Legacy script directory
├── templates         # Pulumi project templates
├── tools             # Legacy development tooling
└── .versions         # Ad-hoc version pinning
```
