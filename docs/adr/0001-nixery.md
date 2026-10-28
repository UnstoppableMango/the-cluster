# Nixery is a LAN-only registry for non-critical images

Nixery (`apps/nixery`) builds container images from nixpkgs on request and serves them at `nixery.thecluster.lan`.
Cluster workloads, the ARC runners, and workstations pull from it directly.

## Decisions

- **Non-critical workloads only.**
  Nixery is one replica on one `ReadWriteOnce` volume, reached through the nginx Gateway.
  While it is down, a pod whose image is not already cached on its node cannot start.
  Anything the cluster needs to come back up (DNS, storage, the gateway, Flux, auth) keeps pulling from upstream registries, or a Nixery outage would keep the gateway in front of it from starting.
  Nothing enforces this; a reviewer does.
- **The server pins nixpkgs, not the tag.**
  With `NIXERY_CHANNEL` set, Nixery ignores the image tag entirely (`config/pkgsource.go` upstream), and caches a build only when the channel is a full commit hash.
  So `NIXERY_CHANNEL` is a 40-character `nixos-unstable` commit, every image builds from it, and Renovate's `nixpkgs` regex manager moves it to the branch head.
  Each bump rebuilds an image on its next pull.
  Per-image pinning would mean `NIXERY_PKGS_REPO`, a git source that clones nixpkgs into every pod, which is not worth it until two consumers need different nixpkgs.
  Consumers tag `latest`; the tag carries nothing.
- **Upstream nixpkgs.**
  Nixery builds from upstream nixpkgs rather than a package set of ours, since nothing yet needs an image nixpkgs cannot produce.
- **LAN-only, pulled directly.**
  No Cloudflare tunnel and no auth: an open builder on the internet would spend this cluster's CPU and disk for anyone.
  No Harbor proxy-cache in front: Nixery's volume already caches layers.

## Trust

The gateway serves a certificate chaining to the CA in the `thecluster-lan-ca` Bundle.
Nodes trust it through the NixOS system bundle, which containerd reads.
The runners' dind trusts only its own image's bundle, so both runner sets mount the Bundle's ConfigMap at `/etc/docker/certs.d/nixery.thecluster.lan`.
When the gateway moves to the new chain, add the new root to the Bundle's sources and the runners follow.

## Not chosen

nix-snapshotter, which cairn offers as a kubelet option, would run images straight from store paths with no registry.
It means draining every node onto a new snapshotter and defining each image in a flake, so it waits until an image is worth that.
