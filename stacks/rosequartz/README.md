# Rosequartz

Management cluster for THECLUSTER.
Provisions Talos Linux on a raspberry pi.
Default configuration assumes a single node cluster.

## Environment Variables

Scripts are intended to be able to be run without input, but most aspects are configurable.
All environment variables are prefixed with `ROSEQUARTZ_` to prevent clashing with existing variables.

|Variable|Description|Default|
|:-------|:----------|:------|
|`ROSEQUARTZ_STACK`|Terraform workspace (stack) to operate on|`dev`|
|`ROSEQUARTZ_TALOS_DIR`|Path to a directory for talos configuration|`.talos/$ROSEQUARTZ_STACK`|
|`ROSEQUARTZ_KUBE_DIR`|Path to a directory for kubernetes configuration|`.kube/$ROSEQUARTZ_STACK`|
|`ROSEQUARTZ_BACKUP_DIR`|Path to a directory for etcd backups|`$ROSEQUARTZ_TALOS_DIR`|
|`ROSEQUARTZ_TALOSCONFIG`|Path to a talosconfig file|`$ROSEQUARTZ_TALOS_DIR/talosconfig`|
|`ROSEQUARTZ_KUBECONFIG`|Path to a kubeconfig file|`$ROSEQUARTZ_KUBE_DIR/config`|
|`ROSEQUARTZ_NODE_IP`|Node IP to use for configuration end endpoints|`10.5.0.2`|
|(unused) `ROSEQUARTZ_TALOS_VERSION`|Talos version to use for generating configuration|`1.5.2`, `.versions/talos`|
|(unused) `ROSEQUARTZ_K8S_VERSION`|Kubernetes version to use for generating configuration|`1.28.1`, `.versions/k8s`|
|`ROSEQUARTZ_DRY_RUN`|Whether to perform a dry run on the operations that support it||

## Local Development

The quickest way to stand up rosequartz is to use the CI scripts.

Running `./ci/up.sh` will:

- Start a Talos Linux docker container in maintenance mode
- Apply terraform configuration
- Write talosconfig and kubeconfig to `.talos/dev/` and `.kube/dev/` respectively

Alternatively these steps can be done manually.

Create the Talos node.

```shell
cd ci
docker compose up
```

Apply configuration.

```shell
terraform apply -var-file=vars/dev.tfvars
```

Write talosconfig and kubeconfig for connecting to the node.

```shell
terraform output -raw talosconfig >"$TALOSCONFIG"
terraform output -raw kubeconfig >"$KUBECONFIG"
```

## Directories

### `.kube/<env>`

Created by various development/testing/deployment scripts.
By default, all scripts will look in this directory for a Kubeconfig file.

### `.talos/<env>`

Created by various development/testing/deployment scripts.
By default, all scripts will look in this directory for a Talosconfig file.
Scripts that generate configuration files will put them here.

### `.versions`

External dependency versions stored as files.
The filename represents the depencency name, and the file contents are the dependency version.

### `ci`

CI/CD scripts and resources.

### `hack`

Utility scripts for development.

### `patches`

Talos machine configuration patches and templates.
Templates should be parseable by terraform's `templateFile`.

### `scripts`

Shared scripts for CI, testing, and development.

### `spec`

Test scripts, files, and resources.

### `vars`

Terraform variable files.
