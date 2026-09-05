# Copilot Instructions for the-cluster

## Repository Overview

This is a homelab infrastructure repository for a single cluster, `rosequartz`, deployed entirely via Kubernetes and Flux CD. No stacks are defined in Pulumi/TypeScript here; the only remaining use of Pulumi is `hack/pki-ca-secret.sh`, which reads an external stack.

## Repository Structure

- `apps/` - Flux GitOps manifests for application deployments
- `clusters/` - Flux cluster bootstrap Kustomizations
- `infrastructure/` - Flux GitOps manifests for infrastructure (controllers/configs)
- `hack/` - Development scripts, the sealed-secrets cert, and the `hack/secrets/` stub tree
- `charts/` - Custom Helm charts
- `containers/` - Nix and Dockerfile definitions for images built here
- `nix/` - Flake packages and checks (manifest validation, CRD generation)

## Code Style & Formatting

- Use **spaces** (2 spaces) for YAML files and Nix files; tabs elsewhere
- Run `make fmt` (`nix fmt`, which runs nixfmt) before committing
- `dprint fmt` covers JSON, Markdown, and TOML only, and is not wired into `make fmt` or CI
- Follow `.editorconfig` settings: insert final newline, trim trailing whitespace

## Kubernetes & Flux

- Flux manifests are in `clusters/`, `apps/`, and `infrastructure/`
- Use Kubernetes best practices for manifests
- Follow existing patterns for Flux Kustomizations and HelmReleases

## Building & Testing

- Use `make` commands defined in the `Makefile` for common tasks
- Format code: `make fmt` (`nix fmt`)
- Check before pushing: `make check` (`nix flake check`). This is the only CI job: it runs the treefmt formatting check plus `validate-flux`, which is kubeconform in strict mode against pinned Flux CRD schemas.

## Dependencies

- Go tools managed via `go.mod` (tools like `kubeseal`, `yq`, `devctl`)
- Nix flake available for reproducible development environment

## Version Pinning

- Chart and image versions are pinned inline in the HelmRelease or manifest and bumped by Renovate (`.github/renovate.json`)
- Check existing patterns before adding new dependencies
