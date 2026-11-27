# Harbor

Harbor runs from `apps/harbor-system` at `https://harbor.thecluster.lan`.
`docs/harbor-plan.md` has the plan and `CONTEXT.md` the terms.

## Proxy caches

thecluster-operator reconciles the `Registry` and the four `ProxyCache` objects in `apps/harbor-system/proxy-cache.yml`.
Each one is a public Harbor project of the same name that fetches from its upstream on first pull:

| Project     | Upstream          |
| ----------- | ----------------- |
| `dockerhub` | Docker Hub        |
| `ghcr`      | `ghcr.io`         |
| `quay`      | `quay.io`         |
| `k8s`       | `registry.k8s.io` |

A pull goes through the project in place of the upstream host, so `docker.io/library/busybox` becomes `harbor.thecluster.lan/dockerhub/library/busybox`.

Inspect them with:

```sh
kubectl -n harbor-system get registries,proxycaches
kubectl -n harbor-system describe proxycache dockerhub
```

`Ready` false with a reason names what failed, such as Harbor being unreachable or a project that proxies something else.

Change a cache by editing its manifest, never in Harbor's UI: the operator puts back anything changed there on its next resync.
Removing a `ProxyCache` deletes its cached repositories, its project and its registry endpoint.
