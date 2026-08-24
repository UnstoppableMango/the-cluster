# Copilot Instructions for the-cluster

## Repository Overview

This is a homelab infrastructure repository deployed entirely via Kubernetes and Flux CD. There is no Pulumi/TypeScript in this repository anymore — all stacks were migrated to Flux manifests.

## Repository Structure

- `apps/` - Flux GitOps manifests for application deployments
- `clusters/` - Flux cluster bootstrap Kustomizations
- `infrastructure/` - Flux GitOps manifests for infrastructure (controllers/configs)
- `hack/` - Development scripts and tooling
- `charts/` - Custom Helm charts

## Code Style & Formatting

- Use **spaces** (2 spaces) for YAML files and Nix files
- Run `dprint fmt` or `make fmt` to format code before committing
- Follow `.editorconfig` settings: insert final newline, trim trailing whitespace

## Kubernetes & Flux

- Flux manifests are in `clusters/`, `apps/`, and `infrastructure/`
- Use Kubernetes best practices for manifests
- Follow existing patterns for Flux Kustomizations and HelmReleases

## Building & Testing

- Use `make` commands defined in the `Makefile` for common tasks
- Format code: `make fmt` (runs dprint and nix formatters)
- CI runs dprint formatting checks on all pull requests

## Dependencies

- Go tools managed via `go.mod` (tools like `kubeseal`, `yq`, `devctl`)
- Nix flake available for reproducible development environment

## Version Pinning

- Version constraints may be in `.versions/` directory
- Check existing patterns before adding new dependencies
