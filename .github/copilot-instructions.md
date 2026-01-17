# Copilot Instructions for the-cluster

## Repository Overview

This is a homelab infrastructure repository built on Kubernetes with Pulumi (TypeScript) and Flux CD.

## Repository Structure

- `apps/` - Pulumi stacks for application deployments
- `clusters/` - Cluster bootstrapping Pulumi stacks
- `components/` - Reusable Pulumi component packages
- `infra/` - Infrastructure Pulumi stacks
- `flux/` - Flux GitOps manifests
- `lib/nodejs/` - Shared TypeScript/Node.js libraries
- `crds/` - Generated CRD code (do not edit manually)
- `hack/` - Development scripts and tooling
- `charts/` - Custom Helm charts

## Code Style & Formatting

- Use **tabs** for indentation (not spaces) in TypeScript, JavaScript, and most files
- Use **spaces** (2 spaces) only for YAML files and Nix files
- Use **single quotes** for TypeScript strings (configured in dprint)
- Run `dprint fmt` or `make fmt` to format code before committing
- Follow `.editorconfig` settings: insert final newline, trim trailing whitespace

## TypeScript & Pulumi Conventions

- Each Pulumi stack has its own directory under `apps/`, `clusters/`, or `infra/`
- Stack structure typically includes:
  - `Pulumi.yaml` - Stack configuration
  - `index.ts` - Main entry point
  - `config.ts` - Configuration values
  - `tsconfig.json` - TypeScript configuration
  - `package.json` - Dependencies
- Use Pulumi's declarative resource model
- Prefer component resources for reusable infrastructure patterns
- Store shared Pulumi code in `lib/nodejs/`

## Kubernetes & Flux

- Flux manifests are in `flux/clusters/`
- Use Kubernetes best practices for manifests
- Follow existing patterns for Flux Kustomizations and HelmReleases

## Building & Testing

- Use `make` commands defined in the `Makefile` for common tasks
- Format code: `make fmt` (runs dprint and nix formatters)
- CI runs dprint formatting checks on all pull requests
- Build and deploy Pulumi stacks with: `make <stack-directory> CMD=<up|preview|destroy> STACK=<stack-name>`
  - Example: `make apps/deemix CMD=up STACK=pinkdiamond`
  - Available stack directories: `apps/*`, `infra/*`

## Dependencies

- Node.js/TypeScript packages managed via Yarn workspaces
- Go tools managed via `go.mod` (tools like `kubeseal`, `yq`, `crd2pulumi`)
- Nix flake available for reproducible development environment

## CRDs (Custom Resource Definitions)

- Generated CRD code is in `crds/` directory
- Do not manually edit generated CRD files
- Use `crd2pulumi` to regenerate when CRDs change

## Version Pinning

- Version constraints may be in `.versions/` directory
- Check existing patterns before adding new dependencies
