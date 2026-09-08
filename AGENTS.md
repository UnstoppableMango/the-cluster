# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Overview

Homelab infrastructure-as-code for a single Kubernetes cluster, `rosequartz`, deployed entirely via Flux CD.
No stacks are defined in Pulumi; the only remaining use of Pulumi is `hack/pki-ca-secret.sh`, which pulls the CA out of the external `UnstoppableMango/pki/prod` stack.

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
