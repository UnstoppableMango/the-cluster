# Harbor plan

Harbor is running from `apps/harbor-system` (#4637) at `https://harbor.thecluster.lan`.
This is the plan for turning it into something the cluster depends on, and the research behind how its configuration is managed.

Two rules shape it:

- Configuration is declarative. A custom script has to justify itself.
- Everything the feature consumes ships as a proper release, pinned by version and bumped by Renovate.
  A bare commit or a moving tag is not a release.

## Goals

1. A pull-through cache for Docker Hub, ghcr.io, quay.io and registry.k8s.io, with every node pulling through it.
2. A failover plan for when Harbor is down or serving something wrong.
3. Our own images (`unmango/containers`, the `unmango/charts` OCI charts) pushed to Harbor as well.
4. Long term, a cluster that can run fully offline, with registries and images described by our own CRDs and Harbor as the first backend.

## Components and their release state

| Component                                    | Used for                          | Released?                                                                                     |
| -------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| Harbor chart (`goharbor/harbor-helm`)        | Harbor itself                     | Yes, chart pinned at `1.19.2`; Harbor images overridden to `v2.15.3`                          |
| `unmango/thecluster-operator`                | Registry and ProxyCache CRDs      | No. No tags, no versioned chart; images are `sha-<short>` and `main` only                     |
| Harbor Terraform provider (`goharbor/harbor`)| Alternative config surface        | Yes, `v3.12.4` (2026-08-11), releasing every few weeks                                        |
| `modules/registry-mirror` in UnstoppableMango/nixos | containerd mirrors on nodes  | Not applicable: flake input, deployed with `clan machines update`                             |
| cairn                                        | kubelet and containerd            | Flake input; containerd config stays at version 2 (see [step 3](#3-node-mirrors))         |

thecluster-operator is the gap.
`unmango/thecluster-operator#139` added `registry.thecluster.io/v1alpha1` `Registry` and `ProxyCache` with a Harbor backend, but there is nothing to pin to except commit `f8da0a7`.

## Declarative configuration for Harbor

Harbor keeps registries, projects, robot accounts and replication rules in its database and exposes them only through its REST API.
There is no config file or CRD for them, so every declarative option is something that drives that API.

### Terraform / OpenTofu provider

[`goharbor/terraform-provider-harbor`](https://github.com/goharbor/terraform-provider-harbor) is maintained under the goharbor organization and released often (`v3.12.4`, 2026-08-11).
It covers everything this plan needs and more: `harbor_registry` (`provider_name` includes `docker-hub`, `docker-registry`, `github`, `quay`), `harbor_project` with `registry_id` for proxy-cache projects plus `public` and `force_destroy`, robot accounts, retention and immutability rules, replication, garbage collection and configuration.

The question is how it runs in a GitOps cluster.
[tofu-controller](https://github.com/flux-iac/tofu-controller) (`v0.16.4`, June 2026) is the Flux-native way: a `Terraform` CR points at a Flux source, plans and applies in a runner pod, and keeps state in a Kubernetes Secret.
Drift detection and plan-only mode are built in.

Costs: a new controller and its runner pods, Terraform state in the cluster, and HCL living in this repo next to YAML.
The provider authenticates as a Harbor admin, the same as anything else here would.

### Pulumi

[`pulumiverse-harbor`](https://www.pulumi.com/registry/packages/harbor/) is a bridge of the Terraform provider, but its last release is `v3.10.21` from 2025-06-30, over a year behind the provider it wraps.
Pulumi can bridge the current Terraform provider directly instead (`pulumi package add terraform-provider goharbor/harbor`), and the Pulumi Kubernetes Operator can run a stack from a Flux source.

This repo deliberately has no Pulumi stacks left (`AGENTS.md`); the only use is reading the CA out of `UnstoppableMango/pki/prod`.
Bringing Pulumi back for Harbor alone reintroduces a toolchain and a state backend the repo moved away from, and gives nothing the Terraform route does not.

### Crossplane

[`provider-upjet-harbor`](https://marketplace.upbound.io/providers/jonasz-lasut/provider-upjet-harbor/latest) (`v1.2.1`) is an Upjet build of the same Terraform provider: 45 managed resources as CRDs.
It is a single-maintainer community provider, and Crossplane itself is not installed on rosequartz (it was on pinkdiamond, see `docs/migration/pinkdiamond-wiring.yaml`).
It is the most Kubernetes-native option, but a heavy one: Crossplane core, a provider package, and a dependency on one person keeping the Upjet build current.

### Harbor's own operator

[`goharbor/harbor-operator`](https://github.com/goharbor/harbor-operator) was archived on 2025-08-08.
It deployed Harbor; managing projects and registries was only on its roadmap.
Not an option.

### Our own operator

thecluster-operator's `Registry` and `ProxyCache` already do what step 2 needs: they create the registry endpoint and the proxy-cache project, put back settings changed in the UI on each resync, and refuse to take over a project that proxies something else.
It is also where goal 4 (our own registry and image CRDs) was always going to live.

Costs: we own a Harbor API client and its tests, and every new Harbor feature is code rather than a resource someone else maintains.
Until it is released, there is nothing to pin.

`UnstoppableMango/terraform2crd` exists but is an empty repository, so generating CRDs from the Terraform provider is not an option today.

### Comparison

| Option                    | Maintained upstream | Coverage of Harbor | New in-cluster dependencies     | Ours to maintain        |
| ------------------------- | ------------------- | ------------------ | ------------------------------- | ----------------------- |
| Terraform + tofu-controller | Yes               | Full               | tofu-controller, state Secrets  | HCL only                |
| Pulumi                    | Bridge is stale     | Full via bridge    | Pulumi operator, state backend  | Stack code              |
| Crossplane                | One maintainer      | Full               | Crossplane, provider package    | YAML only               |
| thecluster-operator       | Us                  | Registries, proxy projects | The operator itself     | Go client and controller |

## Recommendation

Release thecluster-operator properly and keep it as the configuration surface.

Goal 4 needs our own CRDs regardless, so the operator is not extra work that tofu-controller would save; it is work that would be duplicated later.
The Terraform provider is the strongest off-the-shelf option, and the fallback if the operator's scope keeps growing: if we find ourselves reimplementing robot accounts, retention and replication, the operator should drive the provider (or be replaced by it) rather than grow its own client.

If you would rather not own Harbor API code at all, tofu-controller with the Terraform provider is the choice, and the operator waits until goal 4.

## Plan

Each step merges and releases before the next one consumes it.

### 1. Release thecluster-operator

- Add release-please the way `unmango/cloudflare-operator` has it: `release-type: go`, versioning `dist/chart/Chart.yaml` `version` and `appVersion`.
- Tags `v*.*.*` already drive the semver image tags in `main.yml`; check the image tag the chart renders matches.
- Publish the chart as an OCI artifact to `ghcr.io/unmango/charts/thecluster-operator`, or keep consuming `dist/chart` from a `GitRepository` pinned by tag, as cloudflare-operator is.
- Cut `v0.1.0`.

### 2. Deploy the operator and the caches

- `infrastructure/controllers/thecluster-operator-system`: a `HelmRelease` pinned to the release, image pinned by tag and digest, grouped in Renovate with the chart.
- `apps/harbor-system/proxy-cache`: one `Registry` and four `ProxyCache` objects (`dockerhub`, `ghcr`, `quay`, `k8s`).
- `apps-harbor-system` depends on `infra-thecluster-operator`.
- `docs/harbor.md`: how to inspect and change the caches.

This is closed #4638 again, with release pins instead of a commit.

### 3. Node mirrors

`modules/registry-mirror` in UnstoppableMango/nixos (closed nixos#427), once the caches exist:

- One `hosts.toml` per upstream under `/etc/containerd/certs.d`, sending pulls and resolves to `harbor.thecluster.lan/v2/<project>` with `override_path`, and the upstream as `server` so containerd falls back on its own.
- `dial_timeout = "2s"` so a dead Gateway falls back quickly instead of after containerd's 30s default.
- The `UnMango Authority` root as the mirror's `ca`, since Harbor serves the `*.thecluster.lan` wildcard.

containerd's config on these nodes is version 2 (nixpkgs writes `version = 2`, cairn adds `io.containerd.grpc.v1.cri` keys).
containerd 2.x migrates it on load, so `plugins."io.containerd.grpc.v1.cri".registry.config_path` is the right key, not `io.containerd.cri.v1.images`.

Before rolling it out, check from a node that the Gateway serves the full chain:

```sh
openssl s_client -connect harbor.thecluster.lan:443 -showcerts </dev/null
crictl pull docker.io/library/busybox:latest
```

### 4. Failover runbook

Already drafted for #4638. It only applies once nodes pull through Harbor, so it lands in `docs/harbor.md` with step 3:

- Unreachable Harbor, a Harbor error, or pihole down: containerd falls back to the upstream on its own. Nothing to do beyond slower pulls and upstream rate limits.
- Harbor answering but wrong (a broken cached manifest): move `/etc/containerd/certs.d` aside on the node, or delete the artifact from the project and pull again.
- A lasting bypass: drop `../modules/registry-mirror` from `kubelet.extraModules` and deploy.

### 5. Our own images

- `unmango/containers` `images.yml` and `unmango/charts` `release.yml` push to Harbor as well as ghcr.io and Docker Hub, with a robot account per repository.
- Harbor refuses pushes to proxy-cache projects, so each repository pushes to a normal project of its own with a push-capable robot account.
- Those projects and robot accounts should be declared the same way as the caches, so this step may need the operator (or provider) to grow support for normal projects and robot accounts.

### 6. Offline

- Replication rules that keep the images the cluster runs present in Harbor, not only cached on first pull.
- Image and registry CRDs in thecluster-operator that describe what the cluster needs, so "can this cluster start offline" is answerable from manifests.
