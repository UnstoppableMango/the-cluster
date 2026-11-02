# VPN egress patterns for a flannel cluster

Research for [the-cluster#4819](https://github.com/UnstoppableMango/the-cluster/issues/4819): how to send every internet-bound connection from a group of pods through one VPN on rosequartz, and what each approach guarantees.

Rosequartz runs plain flannel, which enforces no NetworkPolicy. Multus is installed as the host CNI wrapping flannel, but only on zeus, gaea and apollo.

Researched 2026-11-02. Sources are pinned to the commits read (see [Sources](#sources)). Claims marked **(inferred)** come from reading the code and were not observed on the cluster.

## TL;DR

| Pattern | Kill switch when the tunnel or the VPN container fails | DNS | Pod-to-pod | Cost | PIA port forward |
| --- | --- | --- | --- | --- | --- |
| **1. gluetun sidecar per pod** (current) | **Yes, enforced in the pod's own netns.** iptables policy `DROP` stays in place across tunnel drops and gluetun container restarts. | Through the tunnel (gluetun DoT on 127.0.0.1). Local names go to kube-dns. | Through `FIREWALL_OUTBOUND_SUBNETS` plus routing rules. **The current values are wrong for rosequartz.** | One gluetun and one WireGuard session per pod | Yes: gluetun's PIA port-forward code works with the custom WireGuard provider when given `SERVER_NAMES`. The up-command pushes the port to qBittorrent. |
| **2a. pod-gateway (VXLAN over flannel)** | Client: yes. The default route is deleted, so a broken VXLAN leaves the pod with no route out. Gateway: only if `VPN_BLOCK_OTHER_TRAFFIC=true` (the chart defaults to `false`) or gluetun's firewall is used. The chart's NetworkPolicy does nothing on flannel. | Client DNS goes to the gateway's dnsmasq. Upstream is whatever the gateway's resolv.conf says. | Flannel's `10.1.0.0/16` route stays on `eth0`. The service CIDR must be added to `NOT_ROUTED_TO_GATEWAY_CIDRS`. | One gateway pod plus an init container and a bash sidecar per client. A webhook and cert-manager are required. | Static `nat.conf` DNAT in the gateway. A dynamic PIA port needs glue. |
| **2b. pod-gateway with a multus secondary network** | Same as 2a, but nothing upstream implements it. | Same as 2a | Same as 2a | No VXLAN, but needs an L2 segment between nodes. Multus runs on only 3 of the workers. | Same as 2a |
| **3. gluetun HTTP proxy plus Servarr proxy settings** | **No.** The pod's netns is untouched. Only HTTP made through the app's dispatcher is proxied, and it fails closed when the proxy is down. | The proxy resolves target names (HTTP CONNECT; SOCKS5 sends the domain). Bypassed hosts and the proxy's own name resolve locally. | Must be listed in "Ignored Addresses". Cluster names contain dots, so "bypass local" does not match them. | One shared gluetun | Not applicable (TCP HTTP only, no torrent) |

Bottom line:

- The sidecar is the only pattern here whose leak protection does not rely on something flannel cannot enforce.
- Keep it for the torrent clients and fix its subnets and DNS details.
- A shared gateway is viable only with `VPN_BLOCK_OTHER_TRAFFIC=true` or gluetun's firewall on the gateway. Its client-side guarantee comes from route deletion, not a firewall.
- Proxies are a convenience for the *arr apps. They are not a guarantee, and Servarr's own docs advise against putting the *arr apps behind a VPN at all.

## Facts about rosequartz that change the analysis

1. **Cluster CIDRs.** The service CIDR is `10.0.0.0/24` and the pod CIDR is `10.1.0.0/16` (`nixos/NETWORK.md`; cairn's CoreDNS default `serviceClusterIpRange = "10.0.0.0/24"`). The qbittorrent and deluge sidecars set `FIREWALL_OUTBOUND_SUBNETS=10.42.0.0/16,10.43.0.0/16`, which are k3s defaults and match nothing here. Effects **(inferred)**:
   - Pods on the same node still work, because gluetun always allows the pod's own `eth0` subnet (the node's `/24`).
   - Pods on other nodes are reachable only inbound, through `FIREWALL_INPUT_PORTS` plus established/related.
   - Outbound connections to ClusterIPs (`10.0.0.0/24`), including kube-dns at `10.0.0.254`, are dropped by gluetun's firewall.
   - The right value is `10.1.0.0/16,10.0.0.0/24`, plus `10.0.69.0/24` if LAN hosts must be reachable.
2. **kube-dns does not forward to LAN resolvers.** Cairn's default Corefile has `forward . 1.1.1.1 1.0.0.1`, both at the pinned cairn revision `a2d5a75` and at HEAD, and `clan/rosequartz-cluster.nix` does not override it. The in-cluster `coredns-system` release also forwards to `1.1.1.1 8.8.8.8`. Either way, any query that reaches kube-dns leaves from the node's IP, outside any VPN.
3. **Container runtime.** Containerd bind-mounts one per-sandbox `resolv.conf` into every container of the pod. It is writable unless the container's rootfs is read-only (containerd `internal/cri/server/container_create.go`, "Mount sandbox resolv.config"). So a container that edits `/etc/resolv.conf` in place changes it for the whole pod.
4. **Flannel pod routes.** The flannel CNI plugin adds a route for the whole cluster network (`10.1.0.0/16`) to each pod's IPAM routes (`flannel_linux.go`, `rtes = append(rtes, types.Route{Dst: *nw})`). Cairn's delegate sets `isDefaultGateway = true`. Pod-to-pod traffic therefore has a non-default route. The service CIDR does not.

## 1. gluetun sidecar per pod (current pattern)

Current setup in `apps/media/qbittorrent-statefulset.yml`:

- The `generate-vpn-config` init container (`pia-manual-connections`, `PIA_CONNECT=false`, `PIA_PF=false`) writes `/vpn/wg0.conf`.
- gluetun v3.41.3 runs as a native sidecar (init container with `restartPolicy: Always`) with `VPN_SERVICE_PROVIDER=custom` and `VPN_TYPE=wireguard`.
- A `startupProbe`, `livenessProbe` and `readinessProbe` all call `/gluetun-entrypoint healthcheck`.
- A `postStart` hook runs `ip rule del table 51820`.

### What gluetun does to the pod network namespace

All containers in a pod share one netns, so everything below applies to qBittorrent too.

- **Firewall.** At startup, before any VPN code runs, `main.go` calls `firewallConf.SetEnabled(ctx, true)`. `enable()` sets the INPUT, OUTPUT and FORWARD policies to `DROP` for IPv4 and IPv6 (`firewall/iptables.go` `setIPv4AllPolicies`). It then accepts:
  - `lo`
  - established/related traffic
  - output to the VPN endpoint only (`-d <endpoint> -o eth0 -p udp --dport <port>`, from `acceptOutputTrafficToVPN`)
  - output from the pod IP to the pod's own `eth0` subnet
  - output to each `FIREWALL_OUTBOUND_SUBNETS` entry
  - input on `eth0` from the local subnet, plus `FIREWALL_INPUT_PORTS`
- **Nothing ever reverts it.** `disable()` (which sets the policies back to `ACCEPT`) is only called as a rollback when `enable()` itself fails. On shutdown, `main.go` only runs `routingConf.TearDown()` (routing cleanup). The VPN loop's `cleanup()` on a tunnel failure removes only the VPN input ports, the public-IP data and port forwarding.
- **Routing.** WireGuard installs `ip rule ... lookup 51820`, which sends everything into `wg0`. `FIREWALL_OUTBOUND_SUBNETS` adds routes and iptables accepts that keep those subnets on `eth0`.

### Leak behaviour

| Event | What happens | Leak? |
| --- | --- | --- |
| Pod start | Native-sidecar ordering: the kubelet starts the next container only after the sidecar is `started`, which with a `startupProbe` means the probe succeeded (k8s docs, *Sidecar containers and Pod lifecycle*). qBittorrent starts only after gluetun reports healthy. The earlier `generate-vpn-config` init container talks to the PIA API directly, by design. | No |
| WireGuard peer stops answering | Packets still route into `wg0` and are blackholed. The healthcheck fails, and `HEALTH_RESTART_VPN` (default `true`) restarts the VPN loop. While the loop restarts, `wg0` and its rule are gone and the main-table default route via `eth0` applies, but OUTPUT `DROP` only lets UDP to the VPN endpoint through. | No |
| gluetun container restarts (liveness kill, OOM, crash) | iptables rules and policies live in the pod's netns, which the pause container owns, so they persist while gluetun is down. The new gluetun re-applies `DROP` and appends its rules again. Duplicate ACCEPT rules are possible **(inferred)**; they are harmless. | No |
| gluetun image bump | Changing a sidecar's image restarts only that container, not the pod (k8s docs). Same as the previous row. | No |
| `postStart` hook | Hooks run concurrently with the entrypoint and have no ordering guarantee (k8s *Container Lifecycle Hooks*). The hook could delete the new instance's own `table 51820` rule if it runs late. Traffic would then fall to the `eth0` default route, where OUTPUT `DROP` blocks it. **(inferred)** | No, but connectivity loss until the next VPN restart |
| Pod deletion | Sidecars are terminated after the main containers, in reverse order (k8s docs). | No |
| IPv6 | gluetun sets ip6tables policies to `DROP` too. Flannel here is IPv4-only. | No |

One residual gap: the endpoint ACCEPT rule is not tied to the gluetun process. Any container in the pod can send cleartext UDP to the PIA endpoint IP and port. That is not a practical leak.

Readiness side effect: a sidecar's `readinessProbe` counts toward Pod readiness (k8s docs). While the tunnel is unhealthy, qBittorrent drops out of its Service endpoints, so the WebUI and the *arr apps lose it. That is acceptable and arguably desirable.

### DNS

- At DNS loop start, gluetun reads the private and loopback nameservers from `/etc/resolv.conf` and keeps them as "local resolvers" (`dns/run.go` → `nameserver.GetPrivateDNSServers`). It then writes `nameserver 127.0.0.1` into `/etc/resolv.conf` and serves DNS there, with upstream DoT through the tunnel.
- Names that `IsFQDNLocal` treats as local are sent to those local resolvers, which here means kube-dns. That covers single-label names and the suffixes `.local`, `.lan`, `.private`, `.internal`, `.corp`, `.home` and `.intranet`, so it includes `*.svc.cluster.local` and `*.thecluster.lan`.
  - With the current `FIREWALL_OUTBOUND_SUBNETS`, gluetun's own firewall drops those queries, because kube-dns at `10.0.0.254` is not in an allowed subnet. Cluster-name resolution inside the pod fails **(inferred)**.
  - Once `10.0.0.0/24` is allowed, local names go to kube-dns, which answers cluster names itself and forwards the rest to 1.1.1.1 from the node IP. Only `.lan`-style names leak, and only to Cloudflare.
- Public names never reach kube-dns. Before the tunnel is up, gluetun points resolv.conf at plaintext `1.1.1.1` (`useUnencryptedDNS`), but OUTPUT `DROP` blocks it, so there is no leak.
- **Restart quirk (inferred).** `patchResolvFile` uses `os.WriteFile`, which edits the file in place. With containerd's shared per-sandbox `resolv.conf`, the edit is visible to every container in the pod and survives a gluetun container restart. When gluetun restarts, it re-reads resolv.conf, finds only `127.0.0.1`, and records that as its "local resolver". Local names are then forwarded to itself. Expect cluster-name resolution to break after a gluetun container restart until the pod is recreated. This is worth confirming with `kubectl exec ... cat /etc/resolv.conf` after a restart.
- `DNS_KEEP_NAMESERVER=on` would send everything to kube-dns and then to 1.1.1.1 from the node, which is a full DNS leak. gluetun's own settings comment warns about this.

### Pod-to-pod traffic

- Outbound: allowed for the pod's `eth0` `/24` automatically, and for any `FIREWALL_OUTBOUND_SUBNETS` entry. Set it to `10.1.0.0/16,10.0.0.0/24`. The wiki notes that the list must not overlap the VPN's address range. PIA's WireGuard peer IPs are in `10.x`, so check the generated `Address` against `10.0.0.0/24` and `10.1.0.0/16` **(inferred risk)**.
- Inbound: `FIREWALL_INPUT_PORTS` (`8080,6881`) on `eth0`. Replies leave through gluetun's inbound routing rules plus established/related.

### Resource cost

- Per pod: one gluetun (requests 10m CPU / 64Mi, limit 256Mi in the current manifest), one init run of `pia-manual-connections`, and one PIA WireGuard session.
- N VPN'd pods means N tunnels and N PIA sessions.
- Actual usage was not measured here. Use `kubectl top pod --containers` before resizing.

## 2. Shared gateway

On flannel, a pod cannot simply use another pod as its next hop across nodes. Flannel forwards by destination only. That is why pod-gateway builds an overlay.

### 2a. angelnu pod-gateway (VXLAN, no multus)

Components:

- `gateway-admision-controller`, a mutating webhook (needs cert-manager).
- A gateway Deployment from the `pod-gateway` chart 7.1.1, appVersion v1.13.0. It can run gluetun beside it; the chart's commented gluetun container pins `v3.41.3`.

Mechanics, from `bin/*.sh`:

- **Client init** (`client_init.sh`):
  - adds routes for `NOT_ROUTED_TO_GATEWAY_CIDRS` via the original gateway
  - **deletes the default route** (`ip route del 0/0`) and the IPv6 default route
  - checks that pinging 8.8.8.8 fails ("WE SHOULD NOT BE ABLE TO PING -> EXIT")
  - resolves the gateway via kube-dns and adds a host route to it
  - creates `vxlan0` to the gateway pod IP
  - gets an IP and default route from the gateway by DHCP, or uses a static `nat.conf` entry
- **Client sidecar** (`client_sidecar.sh`): pings the gateway's VXLAN IP every 10s and re-runs `client_init.sh` on failure, for example when the gateway pod gets a new IP. The webhook can inject it as a native sidecar (`sidecarAsInit`, "Requires Kubernetes v1.29").
- **Gateway init** (`gateway_init.sh`):
  - enables `ip_forward`
  - creates `vxlan0` with IP `172.16.0.1`
  - adds `MASQUERADE`
  - adds DNAT rules for `nat.conf` ports arriving on `VPN_INTERFACE`
  - only if `VPN_BLOCK_OTHER_TRAFFIC=true`:
    - sets FORWARD and OUTPUT policies to `DROP`
    - accepts forwarding only out of `VPN_INTERFACE` and to `VPN_LOCAL_CIDRS`
    - accepts OUTPUT to any destination on `VPN_TRAFFIC_PORT`
- **Gateway sidecar** (`gateway_sidecar.sh`): dnsmasq on `vxlan0` handles DHCP and DNS. `server=/local/<k8s DNS>` sends `DNS_LOCAL_CIDRS` (default `local`) to kube-dns. Other names use the gateway's resolv.conf, which is copied on change by inotifyd.

Guarantees:

- **Client side (gateway down, VXLAN broken, sidecar dead):** no default route, so internet traffic fails instead of leaking. Only `NOT_ROUTED_TO_GATEWAY_CIDRS` and the host route to the gateway go out via `eth0`. This is route-based, not a firewall. Anything in the client with `NET_ADMIN` could re-add a route.
- **Gateway side:**
  - The chart default is `VPN_BLOCK_OTHER_TRAFFIC: false`. For egress it relies on a `NetworkPolicy` that allows only UDP 1194 to `0.0.0.0/0`. **On flannel that policy is not enforced.** If the VPN client in the gateway dies, forwarded client traffic is masqueraded out of `eth0`. That is a leak.
  - With `VPN_BLOCK_OTHER_TRAFFIC=true`, FORWARD only exits `VPN_INTERFACE`, so no leak. The defaults are `VPN_INTERFACE=tun0` and `VPN_TRAFFIC_PORT=443`/`1194`; set them to `wg0` and the WireGuard port.
  - `VPN_LOCAL_CIDRS` defaults to `10.0.0.0/8 192.168.0.0/16`. Here that covers the LAN (`10.0.69.0/24`, `192.168.1.0/24`), so client traffic to the LAN exits in the clear by design.
- **gluetun as the gateway's VPN:** gluetun's firewall also applies in the gateway netns. FORWARD `DROP` plus gluetun's rules gives a kill switch even when `VPN_BLOCK_OTHER_TRAFFIC=false`. However, gluetun must be told to accept the gateway's own traffic. **(inferred, not documented upstream; the k8s-at-home guide could not be fetched)** That means:
  - `FIREWALL_INPUT_PORTS` for the VXLAN UDP port and DHCP 67/udp, because clients on other nodes are outside gluetun's "local subnet"
  - `FIREWALL_OUTBOUND_SUBNETS` for the pod and service CIDRs
  - pod-gateway's `FORWARD -o wg0 ACCEPT` rules, which `gateway_init.sh` adds only with `VPN_BLOCK_OTHER_TRAFFIC=true`

  gluetun's `enable()` appends without flushing existing rules, so pod-gateway's init rules, which run first, survive.
- **DNS:**
  - With `DNSPolicy: None` (the chart default), clients use `172.16.0.1` (dnsmasq).
  - If gluetun runs in the gateway, the shared resolv.conf points at gluetun's `127.0.0.1` DoT server, so upstream DNS goes through the tunnel. dnsmasq's copy of resolv.conf would then contain `127.0.0.1`, which works only because both share the gateway netns **(inferred)**.
  - `.local` goes to kube-dns, which forwards anything outside the cluster to 1.1.1.1 from the node.
- **Pod-to-pod:**
  - Flannel's `10.1.0.0/16` route is not the default route, so it survives on `eth0`. Pod IPs stay direct.
  - **The service CIDR `10.0.0.0/24` has no such route.** It must go in `NOT_ROUTED_TO_GATEWAY_CIDRS`, otherwise ClusterIP traffic, kube-dns included, goes into the VXLAN.
  - Inbound to clients works, since `eth0` is untouched.
- **Cost:**
  - One gateway pod with gluetun and dnsmasq, plus the webhook Deployment.
  - Per client: one init container and one bash/ping sidecar, both root with `NET_ADMIN`.
  - VXLAN inside flannel's VXLAN costs another 50 bytes of MTU. pod-gateway adjusts this only if `VPN_INTERFACE_MTU` is set.
  - All VPN'd pods share one tunnel and one exit IP.
- **Port forwarding:** a static `nat.conf` (`hostname IP tcp:port,udp:port`) DNATs a port from the VPN interface to a client with a static VXLAN IP. The chart notes that changing it needs a manual gateway restart. PIA's port is dynamic, so it would need glue that rewrites `nat.conf` and restarts the gateway, or gluetun `VPN_PORT_FORWARDING_UP_COMMAND` that adds the DNAT and updates the client. Nothing upstream provides this.

### 2b. pod-gateway with multus

Neither `pod-gateway`, `gateway-admision-controller`, nor the chart references multus. The variant would be custom:

- Attach the gateway and clients to a secondary `NetworkAttachmentDefinition` (macvlan or bridge on a dedicated VLAN).
- Use multus's `default-route` key in the `k8s.v1.cni.cncf.io/networks` annotation (multus `docs/how-to-use.md`) to point clients' default route at the gateway's secondary IP.

This replaces VXLAN, DHCP and the ping sidecar with plain L2 and IPAM, but cross-node L2 needs a real shared segment. Here multus is configured only on zeus, gaea and apollo (`modules/ceph-cluster-network`, for Ceph's macvlan on the SFP+ link), so VPN'd pods would be pinned to those nodes.

Leak properties:

- Client: if the gateway dies, the default route points at a dead next hop, so traffic fails without leaking, as long as `eth0` keeps no default route. Multus `default-route` handles that.
- Gateway: same as 2a.
- No upstream code: the webhook mutation, DNS and NAT would all be written in-house.

### Gluetun alone as a "gateway pod"

Without pod-gateway, a shared gluetun pod can only serve as a **proxy** (section 3). Routing other pods through it needs the overlay described above. gluetun has no client-side component.

## 3. gluetun HTTP/SOCKS proxy plus Servarr proxy settings

gluetun v3.41.3:

- `HTTPPROXY=on` listens on `:8888` and supports `CONNECT` (`internal/httpproxy/handler.go`). It resolves targets with gluetun's own DNS, which goes through the tunnel. Optional `HTTPPROXY_USER`/`HTTPPROXY_PASSWORD`. Add `8888` to `FIREWALL_INPUT_PORTS` so clients on other nodes can reach it.
- `SHADOWSOCKS=on` is a Shadowsocks server, not a SOCKS5 server. The Servarr apps cannot speak it.
- A plain SOCKS5 server (`SOCKS5_ENABLED`, `internal/socks5`) exists only on gluetun's `master`. It is in no tag up to v3.41.3, the latest release.

Servarr side:

- Sonarr, Radarr and Lidarr have Settings → General → Proxy with these fields: Type (HTTP(S), Socks4, Socks5), Hostname, Port, Username, Password, "Ignored Addresses", and "Bypass Proxy for Local Addresses".
- Prowlarr has the same global proxy plus **Indexer Proxies** (HTTP, Socks4, Socks5, FlareSolverr), applied by tag to individual indexers.
- In Sonarr's source, every request through `ManagedHttpDispatcher` gets `handler.Proxy` from `ManagedWebProxyFactory` (`http://`, `socks4://`, `socks5://`). `HttpProxySettingsProvider.ShouldProxyBeBypassed` uses .NET `WebProxy.IsBypassed` plus IP-range entries in the bypass list. "Local" means a host with no dot, or localhost/loopback (Servarr wiki).

What the proxy covers and what bypasses it:

- **Covered:** all HTTP the app makes through its dispatcher. That includes indexers, metadata, update checks and notifications, **and download-client API calls**. `qbittorrent.media.svc.cluster.local` has dots, so "bypass local" does not match it. Add the cluster names and CIDRs (`*.svc.cluster.local`, `10.1.0.0/16`, `10.0.0.0/24`) to Ignored Addresses, or the app will try to reach qBittorrent through the VPN.
- **DNS:**
  - HTTP proxy: `CONNECT host:port`, so the proxy resolves.
  - SOCKS5: .NET sends `ATYP_DOMAIN_NAME` unless the host is an IP literal (`SocksHelper.cs`), so the proxy resolves.
  - SOCKS4 (not 4a): .NET calls `Dns.GetHostAddressesAsync` locally, which **leaks the lookup** to kube-dns and then to 1.1.1.1 from the node.
  - Bypassed hosts and the proxy's own hostname always resolve locally.
- **Not covered:** anything outside the dispatcher, and the rest of the container. Nothing at the network layer stops a direct connection, and flannel cannot enforce a NetworkPolicy that would. If the proxy is down, proxied requests fail (fail-closed for those requests). If someone unticks "Use Proxy", traffic goes direct with no error.
- **Torrent clients:** a proxy does not fit them. An HTTP proxy carries only TCP CONNECT, so no DHT or uTP. qBittorrent's own SOCKS5 support would need gluetun's unreleased SOCKS5 server and UDP ASSOCIATE support, which was not verified.

Servarr's own guidance (`vpn.md`): "Only your **torrent client** should be behind a VPN - not the \*Arr applications". VPN IPs get blocked by image providers and Cloudflare. If specific indexers need a VPN, use Prowlarr Indexer Proxies scoped to those indexers.

Cost: one shared gluetun Deployment and one tunnel. The apps need no `NET_ADMIN`.

## PIA port forwarding

### What PIA requires

From `pia-foss/manual-connections`:

- `port_forwarding.sh` calls `https://<PF_HOSTNAME>:19999/getSignature` with `--connect-to <PF_HOSTNAME>::<PF_GATEWAY>:`, where the TLS name is the server's hostname. It then calls `/bindPort` with the payload and signature **every 15 minutes** (`sleep 900`). The payload carries `port` and `expires_at`.
- The README states: "Port Forwarding is disabled on server-side in the United States".
- `get_region.sh` filters to `port_forward==true` regions only when `PIA_PF=true`. The current init container sets `PIA_PF=false`, so it may pick a region that cannot forward. Running it with `PIA_PF=true` and `PIA_CONNECT=false` still only writes the config: the PF call sits inside the `PIA_CONNECT == true` branch of `connect_to_wireguard_with_token.sh`.
- The written `wg0.conf` holds no server hostname, and the UnstoppableMango image only adds patches for token echo and WireGuard args. **The hostname that gluetun's PF code needs is currently lost.**

### gluetun native PIA provider vs custom WireGuard

- **Native `private internet access`** is OpenVPN only in v3.41.3. PIA is absent from the WireGuard provider allowlist in `settings/wireguard.go`, and the wiki says "native support cannot be added". With OpenVPN, `VPN_PORT_FORWARDING=on` works as-is. The port data persists in `/gluetun/piaportforward.json`, kept for "60 days as long as you bind mount the `/gluetun` directory". That needs a PVC instead of `emptyDir` to keep the same port across pod restarts.
- **Custom WireGuard** (current) plus PIA PF is supported:
  - Set `VPN_PORT_FORWARDING=on`, `VPN_PORT_FORWARDING_PROVIDER=private internet access`, `VPN_PORT_FORWARDING_USERNAME`/`_PASSWORD` (required for PIA by `PortForwarding.Validate`), and `SERVER_NAMES=<WG_HOSTNAME>`.
  - The custom provider sets `PortForward: true` and takes `ServerName` from `SERVER_NAMES[0]` "for PIA port forwarding code used together with the custom provider".
  - The PF code panics if the server name is empty. It derives the API IP by taking the `wg0` address, forcing the last octet to `.1`, then trying `x.y.128.1` and `x.y.0.1` on port 19999 with TLS `ServerName=<SERVER_NAMES>` against PIA's CA.
  - It refreshes the binding every 15 minutes (`keepAlivePeriod`). It opens the forwarded port in the firewall on `wg0` itself (`SetAllowedPort`), so `FIREWALL_VPN_INPUT_PORTS` is not needed.
  - Practical gap: `SERVER_NAMES` must match the server that `pia-manual-connections` picked dynamically. Options:
    - Patch the init image to also write `WG_HOSTNAME` to `/vpn`, and wrap gluetun's command as `sh -c 'SERVER_NAMES=$(cat /vpn/hostname) exec /gluetun-entrypoint'`.
    - Pin the init to one server. That is fragile.

### Getting the port into qBittorrent

- **`VPN_PORT_FORWARDING_UP_COMMAND` / `_DOWN_COMMAND`**, present in v3.41.3 (`settings/portforward.go`), run with `{{PORT}}`, `{{PORTS}}` and `{{VPN_INTERFACE}}` substituted. The wiki's qBittorrent example does the following:
  - On up, it POSTs `json={"listen_port":{{PORT}},"current_network_interface":"{{VPN_INTERFACE}}","random_port":false,"upnp":false}` to `http://127.0.0.1:8080/api/v2/app/setPreferences`.
  - On down, it resets to `listen_port: 0` and `lo`, to work around a qBittorrent bug where the port must be re-set after a reconnect.
  - It requires "Bypass authentication for clients on localhost" (`bypass_local_auth`). That is safe here only because 127.0.0.1 is the shared pod netns.
  - Binding qBittorrent to `wg0` adds an application-level kill switch on top of the firewall.
- **Alternatives:**
  - The port file `/tmp/gluetun/forwarded_port` (`VPN_PORT_FORWARDING_STATUS_FILE`), which the wiki says will be deprecated in v4.
  - The control server's `GET /v1/portforward`. Since v3.41 all routes are private, so it needs an auth config entry such as `routes = ["GET /v1/portforward"]`.
  - Either one can be read by a separate updater container.
- **pod-gateway:** the port lands on the gateway and must be DNAT'd by `nat.conf` (static) to the client. This needs custom glue (see 2a).

## Recommendations for rosequartz

1. Keep the per-pod gluetun sidecar for qbittorrent and deluge. It is the only pattern whose kill switch does not depend on NetworkPolicy.
2. Fix `FIREWALL_OUTBOUND_SUBNETS` to `10.1.0.0/16,10.0.0.0/24` in both StatefulSets.
3. Test the resolv.conf restart quirk: restart the gluetun container, then try `nslookup kubernetes.default` from the qbittorrent container. If it breaks, set `DNS_ADDRESS`, or have the `postStart` hook restore the original nameserver line.
4. For port forwarding:
   - set `PIA_PF=true` in the init container (selects PF-capable regions only)
   - persist `WG_HOSTNAME` and feed it to `SERVER_NAMES`
   - enable gluetun PF with the PIA provider override
   - use the wiki's qBittorrent up/down commands
5. Do not put the *arr apps behind a VPN, per Servarr's guidance. If an indexer needs one, use a shared gluetun with `HTTPPROXY=on` and Prowlarr Indexer Proxies scoped by tag, accepting that this is not a kill switch.
6. Revisit pod-gateway only if the per-pod tunnel count becomes a problem. Then use `VPN_BLOCK_OTHER_TRAFFIC=true` (or gluetun in the gateway), put the service CIDR in `NOT_ROUTED_TO_GATEWAY_CIDRS`, and accept that its client-side guarantee is route deletion.

## Open questions

- PIA's simultaneous-session limit for N sidecars was not checked against a primary source.
- gluetun plus pod-gateway firewall settings (VXLAN port and DHCP in `FIREWALL_INPUT_PORTS`) are inferred from code. The k8s-at-home guide (`docs.k8s-at-home.com/guides/pod-gateway/`) is blocked to fetching.
- Whether a PIA WireGuard `Address` can fall inside `10.0.0.0/24` or `10.1.0.0/16` (overlap warning in gluetun's firewall docs).

## Sources

All read at the commits below on 2026-11-02.

- gluetun `v3.41.3` (`3d1e20c`): `cmd/gluetun/main.go` (firewall enable ~L233, routing teardown ~L319); `internal/firewall/enable.go` (`enable` L74, `disable` L44); `internal/firewall/iptables.go` (`setIPv4AllPolicies` L95, `acceptOutputTrafficToVPN` L147); `internal/vpn/cleanup.go`; `internal/vpn/run.go`; `internal/dns/{run,setup,plaintext,settings}.go`; `internal/configuration/settings/{dns,firewall,health,httpproxy,shadowsocks,portforward,wireguard}.go`; `internal/provider/custom/connection.go` L54-70; `internal/provider/privateinternetaccess/{portforward,provider,connection,httpclient}.go`; `internal/routing/vpn.go` `VPNLocalGatewayIP`; `internal/portforward/service/start.go`; `internal/httpproxy/handler.go`; `internal/server/handlerv1.go`. https://github.com/qdm12/gluetun/tree/v3.41.3
- gluetun `master` (`151fb7a`), for `internal/socks5` existing only after v3.41.3.
- `github.com/qdm12/dns/v2@v2.0.0-rc9.0.20260421173011-9de8e7fdbe3a` (gluetun's pinned module): `pkg/nameserver/system.go` (`patchResolvFile`, `os.WriteFile`), `pkg/nameserver/getlocal.go`, `internal/local/local.go` (`IsFQDNLocal`), `pkg/middlewares/localdns/handler.go`.
- gluetun-wiki (`888ab89`): `setup/advanced/kubernetes.md`, `setup/options/{firewall,port-forwarding,http-proxy,socks5,shadowsocks}.md`, `setup/advanced/{vpn-port-forwarding,control-server}.md`, `setup/providers/{private-internet-access,custom}.md`. https://github.com/qdm12/gluetun-wiki
- angelnu/pod-gateway (`2214a59`): `README.md`, `bin/{client_init,client_sidecar,gateway_init,gateway_sidecar,copy_resolv}.sh`, `config/settings.sh`. https://github.com/angelnu/pod-gateway
- angelnu/gateway-admision-controller (`c6913cb`): `internal/mutation/gatewayPodMutator.go`, `internal/config/config.go` (`sidecarAsInit`). https://github.com/angelnu/gateway-admision-controller
- angelnu/helm-charts (`4db66e9`): `charts/apps/pod-gateway/{Chart.yaml,values.yaml,README_CONFIG.md.gotmpl}`. https://github.com/angelnu/helm-charts
- pia-foss/manual-connections (`645377e`): `README.md` (Disclaimers), `port_forwarding.sh`, `connect_to_wireguard_with_token.sh`, `get_region.sh`. https://github.com/pia-foss/manual-connections
- UnstoppableMango/pia-manual-connections (`ac28e5f`): `README.md`, `entrypoint.sh`.
- Servarr Wiki (`477b14f`): `vpn.md`, `sonarr/settings.md` (Proxy), `prowlarr/settings.md` (Indexer Proxies, Proxy). https://github.com/Servarr/Wiki
- Sonarr (`9a41dfc`): `src/NzbDrone.Common/Http/Proxy/ManagedWebProxyFactory.cs`, `src/NzbDrone.Core/Http/HttpProxySettingsProvider.cs`, `src/NzbDrone.Common/Http/Dispatchers/ManagedHttpDispatcher.cs`. https://github.com/Sonarr/Sonarr
- dotnet/runtime (`c9c97da`): `src/libraries/System.Net.Http/src/System/Net/Http/SocketsHttpHandler/SocksHelper.cs` (SOCKS5 `ATYP_DOMAIN_NAME`; SOCKS4 local `Dns.GetHostAddressesAsync`).
- containerd (`8a9c726`): `internal/cri/server/container_create.go` (sandbox resolv.conf mount), `internal/cri/server/helpers.go`.
- kubernetes/website (`33ea519`): `content/en/docs/concepts/workloads/pods/sidecar-containers.md`, `content/en/docs/concepts/containers/container-lifecycle-hooks.md`. Sidecars are stable since v1.33 per https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/
- multus-cni (`1d81062`): `docs/how-to-use.md` ("Specifying a default route for a specific attachment").
- flannel-io/cni-plugin (`abbed04`): `flannel_linux.go` (cluster-network IPAM route).
- Local: `the-cluster/apps/media/{qbittorrent,deluge}-statefulset.yml`; `the-cluster/infrastructure/controllers/coredns-system/coredns-helm-release.yml`; `nixos/NETWORK.md`; `nixos/clan/rosequartz-cluster.nix`; `nixos/modules/ceph-cluster-network/default.nix`; `cairn/modules/service/coredns/control-plane.nix` (also at pinned rev `a2d5a75`); `cairn/modules/service/network/node.nix`.
