# Harbor

Harbor runs from `apps/harbor-system` at `https://harbor.thecluster.lan`.
Image blobs live in the `harbor-registry` bucket and metadata in the `postgres` CNPG Cluster beside it.

## Pull-through cache

`apps/harbor-system/proxy-cache` keeps one proxy-cache project per upstream:

| Upstream          | Project     | Pull as                                        |
| ----------------- | ----------- | ---------------------------------------------- |
| `docker.io`       | `dockerhub` | `harbor.thecluster.lan/dockerhub/library/nginx` |
| `ghcr.io`         | `ghcr`      | `harbor.thecluster.lan/ghcr/<owner>/<image>`   |
| `quay.io`         | `quay`      | `harbor.thecluster.lan/quay/<org>/<image>`     |
| `registry.k8s.io` | `k8s`       | `harbor.thecluster.lan/k8s/<image>`            |

A CronJob creates any registry or project that is missing every 30 minutes, including on the first run after Harbor comes up.
It only adds, so settings changed in the UI stay.
To run it now: `kubectl -n harbor-system create job --from=cronjob/proxy-cache proxy-cache-now`.

Nodes do not use those names directly.
`modules/registry-mirror` in UnstoppableMango/nixos writes a containerd `hosts.toml` per upstream that sends pulls and resolves through the matching project, so manifests keep their upstream image names.
The project names there and in `proxy-cache.py` have to match.

## Failover

Every node mirror lists the upstream as its `server`, so containerd falls back on its own.
An unreachable gateway, a Harbor error, or a `thecluster.lan` lookup failing because pihole is down sends the pull straight upstream.
That is also how Harbor's own images, and pihole's, come back after a cold start, before either one is serving.
Nothing needs to happen during an outage beyond the slower pulls and the upstream rate limits.

Bypass Harbor entirely when it is answering but wrong, for example serving a broken cached manifest, since a successful response never falls back:

1. On the affected nodes, move the mirror aside: `mv /etc/containerd/certs.d /etc/containerd/certs.d.off`.
   containerd reads the directory on each pull, so no restart is needed.
   The next `clan machines update` puts the directory back.
2. To remove a single bad cache entry instead, delete the artifact from the project in Harbor's UI and pull again.
3. For a lasting bypass, drop `../modules/registry-mirror` from `kubelet.extraModules` in the nixos repo's `clan/rosequartz-cluster.nix` and deploy.

To confirm which path a pull took, `crictl pull <image>` on a node and check Harbor's project for the artifact, or watch `journalctl -u containerd` for the mirror host.

## Verifying a node

```sh
openssl s_client -connect harbor.thecluster.lan:443 -showcerts </dev/null  # chain should reach UnMango Authority
crictl pull docker.io/library/busybox:latest
```

The busybox artifact should then appear in the `dockerhub` project.
