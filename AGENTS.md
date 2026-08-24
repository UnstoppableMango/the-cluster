# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Overview

Homelab infrastructure-as-code for a Kubernetes cluster, deployed entirely via Flux CD. There is no Pulumi in this repository anymore — all stacks were migrated to Flux manifests.

## Commands

### Formatting

```sh
make fmt        # runs dprint + nix fmt
```

CI enforces dprint formatting on all PRs.

### Other

```sh
make reconcile      # flux reconcile source git flux-system
make renovate       # trigger renovate cronjob manually
```

## Architecture

### Layout

1. **`clusters/`** — Flux cluster bootstrap Kustomizations (per-cluster `apps.yaml`/`infrastructure.yaml`)
2. **`infrastructure/`** — Infrastructure manifests, split into `controllers/` (operator installs) and `configs/` (CRs against an installed controller)
3. **`apps/`** — Application manifests

### GitOps

Flux manifests live in `clusters/`, `apps/`, and `infrastructure/`. Sealed Secrets are used for sensitive data — generate with `make <name>-sealed.yml`.

When a Flux manifest deploys a Helm chart with a companion container image (e.g. a chart version and an app image version that must stay in sync), group them in `renovate.json` so Renovate bumps both in a single PR. Use a `packageRules` entry with `groupName` targeting the relevant `HelmRelease` chart dep and the container image dep together.

When a Flux manifest requires a Secret, always create a stub under `hack/secrets/` mirroring the path of the sealed secret (e.g. `hack/secrets/infrastructure/configs/crossplane-system/cloudflare-credentials.yml`). Use `stringData` with empty values so the user can populate and seal it. Never commit real credentials. Apply `umask 0177` before creating any file under `hack/secrets/` so it is written with mode 0600 (owner read/write only).

## Code Style

- **Indentation:** 2 spaces in YAML and Nix
- **Versions:** pinned in `.versions/` directory; check existing patterns before bumping

## Development Environment

Nix flake (`flake.nix`) provides a reproducible devshell. Go tooling (`go.mod`) manages `kubeseal`, `yq`, and `devctl`. Copy `hack/example.envrc` to `.envrc` for direnv setup.
