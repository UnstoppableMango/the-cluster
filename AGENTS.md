# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Overview

Homelab infrastructure-as-code for a Kubernetes cluster (`pinkdiamond`), built with Pulumi (TypeScript) and Flux CD for GitOps.

## Commands

### Formatting

```sh
make fmt        # runs dprint + nix fmt
dprint fmt      # TypeScript/JSON/YAML/TOML formatting only
```

CI enforces dprint formatting on all PRs.

### Deploying Pulumi Stacks

```sh
# Apps and infra stacks
make apps/<name> CMD=preview STACK=pinkdiamond
make apps/<name> CMD=up STACK=pinkdiamond
make infra/<name> CMD=up STACK=pinkdiamond

# Cluster stacks (no Make target)
cd clusters/pinkdiamond && pulumi up
```

`CMD` defaults to `up`, `STACK` defaults to `pinkdiamond`.

### Other

```sh
make reconcile      # flux reconcile source git flux-system
make renovate       # trigger renovate cronjob manually
make bin/pulumi     # download pinned Pulumi binary
make bin/kubectl    # download pinned kubectl binary
make crds/package.json  # regenerate CRD TypeScript from cluster
```

## Architecture

### Stack Layers

1. **`clusters/`** — Cluster bootstrapping (kubeconfig, k8s version pinning)
2. **`infra/`** — Infrastructure stacks (Ceph/Rook storage, identity, networking)
3. **`apps/`** — Application stacks (cert-manager, flux, keycloak, metallb, pihole, etc.)
4. **`components/`** — Reusable Pulumi component packages (oauth2-proxy)

Each stack is an independent Pulumi program with `index.ts`, `config.ts`, `Pulumi.yaml`, and `package.json`.

### Shared Libraries

- **`lib/nodejs/`** — Shared TypeScript utilities exposed as npm packages; includes helpers for cluster StackReferences, Helm chart patterns, and database setup
- **`crds/`** — Auto-generated TypeScript from cluster CRDs via `crd2pulumi`; **do not edit manually**

Cross-stack references use `@unstoppablemango/thecluster` (from `lib/nodejs/`) to access cluster outputs like kubeconfig and provider.

### GitOps

Flux manifests live in `flux/clusters/`. Sealed Secrets are used for sensitive data — generate with `make flux/<name>-sealed.yml`.

### Workspaces

Root `package.json` defines Yarn workspaces: `apps/*`, `clusters/*`, `components/*`, `infra/*`, `crds`, `lib/nodejs`. Run `yarn install` from the root to install all dependencies.

## Code Style

- **Indentation:** tabs in TypeScript/JavaScript; 2 spaces in YAML and Nix
- **Quotes:** single quotes in TypeScript
- **Versions:** pinned in `.versions/` directory; check existing patterns before bumping

## Development Environment

Nix flake (`flake.nix`) provides a reproducible devshell. Go tooling (`go.mod`) manages `kubeseal`, `crd2pulumi`, `yq`, and `devctl`. Copy `hack/example.envrc` to `.envrc` for direnv setup.
