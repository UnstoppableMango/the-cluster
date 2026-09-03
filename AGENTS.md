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

Flux manifests live in `clusters/`, `apps/`, and `infrastructure/`. Sealed Secrets are used for sensitive data.

When a Flux manifest deploys a Helm chart with a companion container image (e.g. a chart version and an app image version that must stay in sync), group them in `renovate.json` so Renovate bumps both in a single PR. Use a `packageRules` entry with `groupName` targeting the relevant `HelmRelease` chart dep and the container image dep together.

#### Secrets

Plaintext stubs live under `hack/secrets/` (gitignored) and mirror the path of the sealed manifest they produce:

```
hack/secrets/apps/dex/dex-credentials.yml  ->  apps/dex/dex-credentials-sealed.yml
```

`hack/secrets.sh` owns the whole workflow. It writes stubs with mode 0600, refuses to seal a stub with empty values, and warns when sealing would rename the secret out from under the workload that mounts it.

```sh
make new-secret SECRET=apps/dex/dex-credentials SECRET_ARGS='-n dex -k CLIENT_SECRET'
make seal SECRET=apps/dex/dex-credentials     # stub -> sealed manifest
make unseal SECRET=apps/dex/dex-credentials   # live cluster secret -> stub
make secrets                                  # what exists, what needs sealing
```

When a Flux manifest requires a Secret, always create the stub as part of the same change, and add the sealed manifest to the directory's `kustomization.yaml`.
Sealing is nondeterministic, so seal only the secret you changed; never bulk re-seal.
`hack/secrets/` is gitignored, so existing stubs hold real values, leave them in place.
Never commit real credentials outside `hack/secrets/`.

## Code Style

- **Indentation:** 2 spaces in YAML and Nix
- **Versions:** pinned in `.versions/` directory; check existing patterns before bumping

## Development Environment

Nix flake (`flake.nix`) provides a reproducible devshell, which supplies `kubeseal`, `yq`, `kubectl`, `flux`, and `shellcheck` and exports each as an uppercase env var the Makefile and `hack/` scripts pick up. Copy `hack/example.envrc` to `.envrc` for direnv setup.

Scripts under `hack/` are bash, `set -euo pipefail`, tab-indented, and must pass `shellcheck`.
