# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Overview

Homelab infrastructure-as-code for a single Kubernetes cluster, `rosequartz`, deployed entirely via Flux CD.
No stacks are defined in Pulumi.
`hack/pki-ca-secret.sh` reads UnMango Private CA 01 from the `UnstoppableMango/pki` Key Vault (`unmango-pki-kv`) into the stub behind `infrastructure/configs/cert-manager-system/issuers/private-ca-sealed.yml`.

## Commands

### Formatting and checks

```sh
make fmt        # nix fmt -> treefmt, which runs nixfmt only
make check      # nix flake check
dprint fmt      # JSON, Markdown, and TOML only; not wired into make fmt or CI
```

`make check` is the CI gate (`.github/workflows/ci.yml` runs `nix flake check` and nothing else).
It runs the treefmt formatting check plus `checks.validate-flux`, which is kubeconform in strict mode against pinned Flux and flux-operator CRD schemas (`nix/validate.nix`).
Run it before pushing manifest changes.

### Other

```sh
make reconcile      # flux reconcile source git flux-system
make renovate       # trigger a renovate cronjob manually; RENOVATE_RELEASE selects the account
```

## Architecture

### Layout

1. **`clusters/`**: Flux cluster bootstrap Kustomizations (per-cluster `apps.yaml`/`infrastructure.yaml`; only `rosequartz` exists)
2. **`infrastructure/`**: Infrastructure manifests, split into `controllers/` (operator installs) and `configs/` (CRs against an installed controller)
3. **`apps/`**: Application manifests
4. **`charts/`**: Local Helm charts (`arc-runner-scale-set`, `redis`) referenced by HelmReleases in this repo
5. **`nix/`**: Flake packages and checks for manifest validation, cert-manager CRDs, and CRD generation
6. **`hack/`**: Scripts, the sealed-secrets public cert, and the `hack/secrets/` stub tree

No container images are built here.
The images this repo deploys that are not upstream come from `github.com/unmango/containers`, for example `ghcr.io/unmango/actions-runner` used by the ARC scale sets.

### GitOps

Flux manifests live in `clusters/`, `apps/`, and `infrastructure/`. Sealed Secrets are used for sensitive data.

When a Flux manifest deploys a Helm chart with a companion container image (e.g. a chart version and an app image version that must stay in sync), group them in `.github/renovate.json` so Renovate bumps both in a single PR. Use a `packageRules` entry with `groupName` targeting the relevant `HelmRelease` chart dep and the container image dep together.

When a Flux manifest requires a Secret, always create a stub under `hack/secrets/` mirroring the path of the sealed secret (e.g. `hack/secrets/infrastructure/configs/crossplane-system/cloudflare-credentials.yml`). Use `stringData` with empty values so the user can populate and seal it. Never commit real credentials. Apply `umask 0177` before creating any file under `hack/secrets/` so it is written with mode 0600 (owner read/write only).

### External secrets

external-secrets (`infrastructure/controllers/external-secrets-system`) pulls Secrets from external stores, and `infra-configs-external-secrets` reconciles the `ClusterSecretStore`s in `infrastructure/configs/external-secrets-system`.
Give each backend its own store, authenticated by an identity that can read only the secrets its consumers need, and restrict it with `spec.conditions` to the namespaces that use it.
The store's credentials are the one thing sealed, as a SealedSecret beside the store in `external-secrets-system`.
A Flux Kustomization holding an `ExternalSecret` depends on `infra-configs-external-secrets`.

### Certificates

Two ClusterIssuers, split by who has to trust the cert:

- `thecluster.lan` signs what a browser or LAN device sees, from UnMango Private CA 01 in `UnstoppableMango/pki`, which chains to the UnMango Root CA G2.
  That CA is name-constrained to `thecluster.lan`, `internal`, `home.arpa`, `local`, and `localhost`, so a Service name or `*.svc` cannot come from it.
- `cluster-internal` signs in-cluster service and client certs from a self-signed CA that never leaves the cluster.

The `thecluster-lan-ca` Bundle fans both CAs (the root inline, the internal CA from its Secret) out to every namespace as a ConfigMap.

### Sealing and unsealing

`hack/secrets/` mirrors the manifest tree, and the Makefile pattern rules derive one path from the other:

```sh
make apps/<path>-sealed.yml            # seal hack/secrets/apps/<path>.yml
make infrastructure/<path>-sealed.yml  # seal hack/secrets/infrastructure/<path>.yml
make apps/<path>-unseal                # pull the live Secret back down into the stub
```

There is one pattern rule per top-level manifest directory rather than a bare `%-sealed.yml`, because make matches a slashless target pattern against the file name alone and would look for the stub in the wrong directory.
`apps/arc-runners/thecluster-bot-sealed.yml` overrides the pattern rule: those runner credentials are fanned out across every scale-set namespace by `hack/arc-fanout-secret.sh`.

## Code Style

- **Indentation:** 2 spaces in YAML and Nix; tabs elsewhere, per `.editorconfig` and `.dprint.json`
- **Versions:** chart and image versions are pinned inline in the HelmRelease or manifest and bumped by Renovate.
- **Storage classes:** a new claim picks a tier class, `fast-rwo`, `standard-rwo`, `standard-rwx`, `bulk-rwx`, or `bucket` for object storage.
  Never `unsafe-rbd`, `ssd-rbd`, `ec-cephfs`, `default-cephfs`, or `ceph-bucket`: those are deprecated aliases kept only because a bound claim's `storageClassName` is immutable.
  Copying an existing manifest carries a deprecated name along with it, so check the class before reusing one.
  The tier says how much loss the claim tolerates and whether the mount is shared; `docs/storage.md` has the pool behind each class and the replacement for each deprecated one.
- **Nested containers:** a pod that runs its own container runtime (dind, podman, buildkitd, kind) sets `runtimeClassName: nested-containers` and `hostUsers: false` rather than `privileged: true`.
  An admission policy enforces both; `docs/nested-containers.md` has the dind recipe.
- **Resources:** every container declares a CPU request, a memory request, and a memory limit.
  Requests track measured steady-state usage rounded up, floored at 10m CPU and 32Mi; memory limits sit at two to three times the observed peak.
  Add a CPU limit only where throttling is acceptable, and omit it on anything holding a leader lease or serving a dataplane.
  Setting a limit without a request is a trap: Kubernetes copies the limit into the request, and the workload reserves its ceiling.

Container resources deserve their own note, because a chart is not evidence that they are set.
Most charts size their main workload and leave a sidecar, an init container, a hook job, or an enabled subchart empty, and a `resources:` key in a values file says nothing about the containers it does not name.
Render the chart and read every container:

```sh
nix develop -c bash -c 'yq eval ".spec.values" <helm-release.yml> > /tmp/v.yaml
  helm template t <chart> --repo <url> --version <v> -f /tmp/v.yaml' \
  | yq eval 'select(.kind == "Deployment" or .kind == "DaemonSet" or .kind == "StatefulSet")
             | .metadata.name, (.spec.template.spec.containers[] | .name + " " + (.resources | tostring))' -
```

Where a container has no values key at all, reach it with `spec.postRenderers` on the HelmRelease, or `spec.patches` on the Flux Kustomization when the manifests come from an upstream path.
Give the patch an explicit `target`, so a chart bump that renames the object is a no-op rather than a reconcile failure.

## Development Environment

Nix flake (`flake.nix`) provides a reproducible devshell, and every tool the Makefile and `hack/` scripts shell out to comes from it.
They are called by their plain names and resolved off `PATH`, so `make` targets that seal secrets or render charts only work inside the devshell.
Copy `hack/example.envrc` to `.envrc` for direnv setup, or prefix one-off commands with `nix develop -c`.
