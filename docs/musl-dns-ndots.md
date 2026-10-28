# musl, ndots, and cluster DNS

## The question

Pods built on musl libc (Alpine images) get Kubernetes' default `options ndots:5`.
Every external name with fewer than five dots then walks the pod's search list before the real lookup.
Can rosequartz fix that once, cluster-wide, the way `ndots:1` would, without editing every pod spec?

## Short answer

There is no kubelet or cluster-level ndots setting.
The kubelet hardcodes `ndots:5` for `ClusterFirst` pods and ignores the node's own `options` line.
The only ways to change it are a pod's own `dnsConfig`, or something that writes `dnsConfig` into pods at admission.

Lowering ndots is more dangerous on musl than on glibc.
musl never falls back to the search list for a name with at least `ndots` dots.
Under `ndots:1`, `svc.ns` stops resolving in a musl pod; under `ndots:2`, `svc.ns.svc` and StatefulSet names like `web-0.web.ns` do.
the-cluster uses `<svc>.<ns>.svc` names in at least ten places.

Recommendation:

1. Leave ndots at 5 and turn on CoreDNS `autopath @kubernetes` with `pods verified`.
   CoreDNS then walks the search list server-side, and a musl pod's first query comes back with the final answer.
   That cuts four round trips to one, and no name changes meaning.
   It is a cairn change to the CoreDNS service, plus a `prometheus` line so the success counter can be checked.
2. Keep the nodes' resolv.conf free of search domains, as it appears to be now, so the pod search list stays at the three `cluster.local` entries that CoreDNS answers itself.
3. Do not inject ndots cluster-wide.
   If one namespace needs it, a MutatingAdmissionPolicy is available on 1.37 with no extra install.
   Make it opt-in per namespace, use `ndots:2` rather than 1, and only where nothing uses `x.y.svc` names.

## How musl resolves

Sources are musl's `master` as of 2026-10-28, which is the 1.2.6 line.
The cgit pages could only be read through a summarizing fetch, so the quotes below are short and the line numbers are not given.

- `search` and `domain` are both read, into the same buffer, so the last line wins.
  `options` honours only `ndots:`, `attempts:` and `timeout:`.
  The defaults are 1, 2 and 5, and the caps are 15, 10 and 60.
  Everything else is ignored, including `single-request`, `single-request-reopen`, `edns0` and `use-vc`.
  ([resolvconf.c](https://git.musl-libc.org/cgit/musl/plain/src/network/resolvconf.c))
- A search line over 256 characters is ignored ([musl wiki](https://wiki.musl-libc.org/functional-differences-from-glibc.html)).
  The search buffer is `char search[256]`, and a domain that would overflow it is skipped ([lookup_name.c](https://git.musl-libc.org/cgit/musl/plain/src/network/lookup_name.c)).
- Order:
  - In `name_from_dns_search`, the dots in the name are counted.
  - When `dots >= conf.ndots` or the name ends in a dot, the search list is cleared and only the literal name is queried.
  - Below that threshold, each search domain is tried first and the literal name is tried last.
  - Source comment: "suppress search when >=ndots or name ends in a dot, which is an explicit request for global scope".
    ([lookup_name.c](https://git.musl-libc.org/cgit/musl/plain/src/network/lookup_name.c))
- The wiki states the glibc difference outright.
  Names with at least `ndots` dots "are only tried in the global namespace (never falling back to search, which glibc would do...)".
  The reason it gives is "a consistency requirement not to return different results subject to transient failures or to global DNS namespace changes outside of one's control (addition of new TLDs)."
  ([wiki](https://wiki.musl-libc.org/functional-differences-from-glibc.html))
- Stopping the search:
  - Inside the loop, `if (cnt) return cnt;` means any nonzero result ends the search.
  - `name_from_dns` returns 0 only for NXDOMAIN (rcode 3).
  - A short reply or SERVFAIL (rcode 2) returns `EAI_AGAIN`, and any other nonzero rcode returns `EAI_FAIL`.
  - NOERROR with no usable records returns `EAI_NODATA`.
    That code was added on 2022-09-20 in "getaddrinfo: add EAI_NODATA error code to distinguish NODATA vs NxDomain" ([log](https://git.musl-libc.org/cgit/musl/log/src/network/lookup_name.c)).
  - All three stop the walk, so a SERVFAIL or a NODATA from any search candidate ends the lookup with an error.
    glibc keeps going in those cases.
  - A 2017 list report hit exactly this with a NODATA answer ([openwall 2017/03/15/3](https://openwall.com/lists/musl/2017/03/15/3)).
- A and AAAA:
  - For `AF_UNSPEC`, both queries go out in one `__res_msend_rc` call ([lookup_name.c](https://git.musl-libc.org/cgit/musl/plain/src/network/lookup_name.c)).
  - `res_msend.c` sends every query to every nameserver at once ("Query all configured namservers in parallel").
  - It retries SERVFAIL immediately, ignores replies with other rcodes, and accepts only NOERROR and NXDOMAIN.
  - It falls back to TCP when the TC bit is set ([res_msend.c](https://git.musl-libc.org/cgit/musl/plain/src/network/res_msend.c)).
  - musl cannot send them one after the other the way glibc's `single-request` does ([wiki](https://wiki.musl-libc.org/functional-differences-from-glibc.html)).
- An NXDOMAIN on one of the pair fails the whole `AF_UNSPEC` lookup, even when the other query answered.
  Rich Felker confirmed in August 2026 that "this behavior is intentional" ([openwall 2026/08/23/11](https://openwall.com/lists/musl/2026/08/23/11)).
  The report that prompted it involved a Pi-hole answering AAAA with NXDOMAIN ([openwall 2026/08/23/1](https://openwall.com/lists/musl/2026/08/23/1)).
  The in-cluster piholes are worth keeping in mind for that.

### Versions

| musl  | Change                                                                                                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1.13 | `search`/`domain` support ([wiki](https://wiki.musl-libc.org/functional-differences-from-glibc.html); committed 2016-01-28, [announcement](https://www.openwall.com/lists/musl/2016/01/29/3))                                     |
| 1.2.4 | DNS over TCP ([wiki](https://wiki.musl-libc.org/functional-differences-from-glibc.html))                                                                                                                                             |
| 1.2.4+ | NODATA distinguished as `EAI_NODATA`. The commit is dated 2022-09-20, between 1.2.3 and 1.2.4, but which release first shipped it is **unverified**.                                                                        |

| Alpine | musl     | Source                                                                                                  |
| ------ | -------- | ------------------------------------------------------------------------------------------------------- |
| 3.17   | 1.2.3-r6 | [pkgs](https://pkgs.alpinelinux.org/packages?name=musl&branch=v3.17&repo=main&arch=x86_64)               |
| 3.18   | 1.2.4-r3 | [pkgs](https://pkgs.alpinelinux.org/packages?name=musl&branch=v3.18&repo=main&arch=x86_64)               |
| 3.22   | 1.2.5-r12 | [pkgs](https://pkgs.alpinelinux.org/packages?name=musl&branch=v3.22&repo=main&arch=x86_64)              |
| 3.24   | 1.2.6-r3 | [pkgs](https://pkgs.alpinelinux.org/packages?name=musl&branch=v3.24&repo=main&arch=x86_64)               |
| edge   | 1.2.6-r6 | [pkgs](https://pkgs.alpinelinux.org/packages?name=musl&branch=&repo=main&arch=x86_64)                    |

The Kubernetes DNS debugging page tells anyone on Alpine 3.17 or earlier to move to 3.18 or later, for the TCP fallback ([dns-debugging-resolution](https://github.com/kubernetes/website/blob/main/content/en/docs/tasks/administer-cluster/dns-debugging-resolution.md), "Known issues").

### glibc, for contrast

`resolv.conf(5)` says a name with at least `ndots` dots is tried as an absolute name first, and the search list follows if that fails.
The default ndots is 1, the cap is 15, and A and AAAA go out in parallel unless `single-request` is set.
([man7 resolv.conf(5)](https://man7.org/linux/man-pages/man5/resolv.conf.5.html))
So under a low ndots, glibc still resolves `svc.ns`: it asks upstream for the absolute name first and wastes one query.
musl fails it outright.

## What Kubernetes does

All references are to kubernetes `v1.37.1`, the minor rosequartz pins (`versions.kubernetes = "1.37"` in nixos `clan/rosequartz-cluster.nix`; kubepkgs `latest` is 1.37.1).

- `ndots:5` is a package variable: `defaultDNSOptions = []string{"ndots:5"}` ([dns.go#L44](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubelet/network/dns/dns.go#L44)).
- For `ClusterFirst`, `GetPodDNS` sets the nameservers to `clusterDNS` and the search list to `<ns>.svc.<domain> svc.<domain> <domain>` followed by the host's search domains.
  It then sets `dnsConfig.Options = defaultDNSOptions`, which throws away whatever `options` the node's resolv.conf had.
  ([dns.go#L165-L175](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubelet/network/dns/dns.go#L165-L175), [#L403-L415](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubelet/network/dns/dns.go#L403-L415))
- The pod's `spec.dnsConfig` is merged in last, and its options override the base ones by name ([dns.go#L327-L354](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubelet/network/dns/dns.go#L327-L354), [#L446-L448](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubelet/network/dns/dns.go#L446-L448)).
- When it parses the host file, the kubelet drops a `search .` entry, the line systemd-resolved writes when it has no search domains ([dns.go#L259-L267](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubelet/network/dns/dns.go#L259-L267)).
- KubeletConfiguration has `clusterDNS`, `clusterDomain` and `resolvConf` (default `/etc/resolv.conf`) and nothing for options ([types.go#L515-L520](https://github.com/kubernetes/kubernetes/blob/v1.37.1/staging/src/k8s.io/kubelet/config/v1beta1/types.go#L515-L520)).
  **Confirmed: there is no kubelet or cluster-level ndots knob.**
- Limits: 3 nameservers, 32 search domains, 2048 characters of search list ([validation.go#L4248-L4252](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/apis/core/validation/validation.go#L4248-L4252)).
  The 32/2048 limits are stable as of 1.28 ([dns-pod-service.md](https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/services-networking/dns-pod-service.md), "DNS search domain list limits").
  musl's own 256-character buffer is far tighter than either.
- `dnsPolicy` values:
  - `Default` inherits the node's resolver.
  - `ClusterFirst` is the default.
  - `ClusterFirstWithHostNet` applies to hostNetwork pods.
  - `None` uses `dnsConfig` only.
  - `dnsConfig.options` is merged over the policy's options, and duplicates are removed.
  - ([dns-pod-service.md](https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/services-networking/dns-pod-service.md))
- `PodDNSConfig.options` is `+listType=atomic` ([core/v1 types.go#L5318-L5324](https://github.com/kubernetes/kubernetes/blob/v1.37.1/staging/src/k8s.io/api/core/v1/types.go#L5318-L5324)).
  An apply-configuration mutation cannot merge into it, so an admission mutation has to replace the list or use JSON Patch.

### In rosequartz today

- cairn's CoreDNS service sets the kubelet's `clusterDns` to the kube-dns ClusterIP and leaves `clusterDomain` at `cluster.local` (`cairn/modules/service/coredns/control-plane.nix`).
- Nothing in cairn or nixos sets the kubelet's `resolvConf`, so it reads `/etc/resolv.conf`.
  On NixOS with systemd-resolved, that is a symlink to `stub-resolv.conf` ([nixpkgs resolved.nix](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/system/boot/resolved.nix)).
- The search list in that file comes from resolved's `Domains`, which defaults to `networking.search`, and that defaults to `[]` ([network-interfaces.nix](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/tasks/network-interfaces.nix)).
  nixos `modules/dns` sets `Domains = [ "~thecluster.lan" ]`, which is routing-only, and the `~` adds no search suffix.
- So pods should get only the three `cluster.local` entries, with no `thecluster.lan`.
  That is inferred from config, and **unverified** on a live node.
  Check it with `kubectl exec <pod> -- cat /etc/resolv.conf`.
- The Corefile, cairn's default, is used unmodified by nixos:

  ```
  kubernetes cluster.local in-addr.arpa ip6.arpa { pods insecure; fallthrough in-addr.arpa ip6.arpa }
  forward . 1.1.1.1 1.0.0.1
  cache 30
  ```

  It has no `prometheus` line, although the `kube-dns` Service is annotated for scraping on port 10055.
- The kubernetes plugin is authoritative for `cluster.local`, so every search candidate is answered with NXDOMAIN inside CoreDNS and never reaches 1.1.1.1.
  A musl lookup of `github.com` therefore costs three wasted round trips to CoreDNS, each an A+AAAA pair, before the real query.
  The fanout is latency and CoreDNS load, not upstream traffic.

## Options compared

| Option | What it changes | Verdict for musl |
| --- | --- | --- |
| a. CoreDNS `autopath @kubernetes` + `pods verified` | When a query matches the first search element (`<name>.<ns>.svc.cluster.local`), CoreDNS walks the rest of the path itself. It returns the first non-NXDOMAIN answer with a CNAME from the asked name. | **Best fit.** musl sends that first candidate first, A and AAAA together, and both get the final answer in one round trip. ndots stays 5, so no name changes meaning. Needs the pod's own IP as the query's source. |
| b. Admission mutation injecting `dnsConfig.options` ndots | Rewrites every matching pod's resolv.conf. | **Works, but breaks names on musl.** `ndots:1` breaks `svc.ns`; `ndots:2` breaks `svc.ns.svc` and `pod.svc.ns`. Only as an opt-in for namespaces known to use FQDNs or bare names. |
| c. NodeLocal DNSCache | Puts a caching agent on each node and avoids DNAT/conntrack for DNS. | **Does not reduce the fanout.** It does avoid the conntrack race that parallel A/AAAA from one socket hit. It also defeats autopath, because CoreDNS then sees the cache's address, not the pod's. |
| d. Kubelet `resolvConf` with no search line | Removes host search domains from pods. | **Already the case here**, as far as config shows. It caps the fanout at three in-cluster candidates. Nothing more to gain. |
| e. Kyverno / Gatekeeper | Same as (b), as third-party controllers. | Same breakage as (b), plus a controller to run. Not installed here. MutatingAdmissionPolicy does the same job in-tree. |

### a. autopath

- Behaviour:
  - It only fires for "a query that matches the first element of the configured search path".
  - On "any failures, the original reply is returned".
  - "If the server side search ultimately results in a negative answer (e.g. NXDOMAIN), then the client will fruitlessly search all paths manually."
  - ([autopath README](https://github.com/coredns/coredns/blob/master/plugin/autopath/README.md), [coredns.io/plugins/autopath](https://coredns.io/plugins/autopath/))
- Requirements:
  - "`pods` must be set to `verified`".
  - "the remote IP address in the DNS packet received by CoreDNS must be the IP address of the Pod that sent the request."
  - `verified` "maintains a watch on all pods in the cluster, which requires additional memory in CoreDNS" and adds apiserver load.
  - ([kubernetes plugin README](https://github.com/coredns/coredns/blob/master/plugin/kubernetes/README.md))
- How it is built:
  - The search list is built per query from the source pod's namespace, followed by CoreDNS's own `/etc/resolv.conf` search domains and an empty sentinel for the bare name ([kubernetes/autopath.go](https://github.com/coredns/coredns/blob/master/plugin/kubernetes/autopath.go), [setup.go `searchFromResolvConf`](https://github.com/coredns/coredns/blob/master/plugin/kubernetes/setup.go)).
  - CoreDNS runs with `dnsPolicy: Default`, so that list is the node's, which keeps server and client in step.
- Why it suits musl, reasoned from the sources above:
  - musl is search-first below ndots, so its very first query is the one autopath intercepts.
  - It sends A and AAAA as separate queries in parallel, and each is autopath'd on its own.
  - For a name with no AAAA, the walk ends on a NOERROR/NODATA for the bare name, which "is not NXDOMAIN", so it comes back with the CNAME and an empty answer.
  - The A reply carries addresses, so `getaddrinfo` succeeds.
  - musl's stop-on-non-NXDOMAIN rule is never triggered by a search candidate, because the client never sees one.
- Edge cases:
  - The walk skips candidates whose rcode the plugin did not write, which includes SERVFAIL ([autopath.go](https://github.com/coredns/coredns/blob/master/plugin/autopath/autopath.go), `plugin.ClientWrite`).
  - An upstream SERVFAIL on the bare name still reaches the client, as it would have anyway.
- Caveats:
  - The README documents a wrong-namespace race when a pod IP is reused before the watch catches up.
  - hostNetwork pods are indexed under the node IP, since `ToPod` copies `status.podIPs` ([object/pod.go](https://github.com/coredns/coredns/blob/master/plugin/kubernetes/object/pod.go)).
    Their namespace may be guessed wrong.
    The query then fails `firstInSearchPath` and passes through untouched, so the cost is no speedup, not a wrong answer. This is inferred from the source.
- `pods verified` also changes `a-b-c-d.<ns>.pod.cluster.local` answers: they are now only returned for real pods in that namespace.
  Nothing in the-cluster appears to rely on the insecure form. **Unverified**: this was grepped only for `pod.cluster.local`.
- Whether kube-proxy preserves pod source IPs on the way to the kube-dns ClusterIP is **unverified** for rosequartz (flannel + nixpkgs kube-proxy).
  `coredns_autopath_success_total` answers it once metrics are on.

### b. MutatingAdmissionPolicy

- Feature gate: alpha in 1.32 (the gate existed with no effect in 1.30-1.31), beta and off by default in 1.34-1.35, **GA and on by default from 1.36**.
  Sources: [MutatingAdmissionPolicy.md](https://github.com/kubernetes/website/blob/main/content/en/docs/reference/command-line-tools-reference/feature-gates/MutatingAdmissionPolicy.md); [kube_features.go#L2428-L2432](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/features/kube_features.go#L2428-L2432).
- The admission plugin is in the default-on set ([plugins.go#L164-L192](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubeapiserver/options/plugins.go#L164-L192)).
- cairn and nixos set no `featureGates`, `runtimeConfig` or admission plugin overrides for the apiserver.
  nixpkgs passes its own `--enable-admission-plugins` list ([apiserver.nix](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/services/cluster/kubernetes/apiserver.nix)), but that flag adds to the defaults.
  The nested-containers ValidatingAdmissionPolicy working today shows the default-on set is active.
- So `admissionregistration.k8s.io/v1` MutatingAdmissionPolicy should be live on rosequartz now.
  **Unverified** against the running apiserver: check with `kubectl api-resources | grep mutatingadmission`.
- Mutations are CEL, as an apply configuration or as JSON Patch ([mutating-admission-policy.md](https://github.com/kubernetes/website/blob/main/content/en/docs/reference/access-authn-authz/mutating-admission-policy.md)).
  Because `dnsConfig.options` is atomic, JSON Patch is the safe form.
- Kyverno's sample `add-ndots` policy sets `ndots: "1"` on every Pod with `patchStrategicMerge` ([kyverno.io](https://kyverno.io/policies/other/add-ndots/add-ndots)).
  That is exactly the setting that breaks `svc.ns` for musl.
- Gatekeeper mutation is stable from v3.10 and has a `spec.dnsConfig` Assign example ([gatekeeper docs](https://open-policy-agent.github.io/gatekeeper/website/docs/mutation/)).

### c. NodeLocal DNSCache

It is stable from v1.18.
Pods query a node-local agent that forwards `cluster.local` misses to CoreDNS.
That skips the DNAT and conntrack path, and the agent can talk to CoreDNS over TCP ([nodelocaldns.md](https://github.com/kubernetes/website/blob/main/content/en/docs/tasks/administer-cluster/nodelocaldns.md)).
The motivation cites conntrack races ([kubernetes#56903](https://github.com/kubernetes/kubernetes/issues/56903)).
Commenters on that issue name musl's parallel A/AAAA from one socket, which musl cannot serialize.
It does not touch ndots or the search list.
CoreDNS would see the agent's address rather than the pod's, so it rules out autopath.

## Recommended plan

### 1. cairn: make autopath an option of the CoreDNS service

The files follow the repo rule that a service option is added to the role and the cluster option tree together.

- `modules/service/coredns/control-plane.nix`: add `autopath` (bool, default `false`).
  When set, the default Corefile switches `pods insecure` to `pods verified` and adds `autopath @kubernetes`.
  Also add `prometheus :${toString ports.metrics}` unconditionally, so the Service's scrape annotation has something behind it:

  ```
  .:10053 {
    errors
    health :10054
    kubernetes cluster.local in-addr.arpa ip6.arpa {
      pods verified
      fallthrough in-addr.arpa ip6.arpa
    }
    autopath @kubernetes
    prometheus :10055
    forward . 1.1.1.1 1.0.0.1
    cache 30
    loop
    reload
    loadbalance
  }
  ```

- `modules/service/coredns/manifests.nix`: the memory limit is hardcoded at `170Mi` with a `70Mi` request.
  `pods verified` keeps the IP, name, namespace and labels of every pod.
  Expose `resources` as an option, or raise the limit once usage is measured.
  The size is **unverified**; measure before and after.
- `modules/service/coredns/README.md`: document the option, the source-IP requirement, and the fact that it is incompatible with NodeLocal DNSCache.
- `flakeModules/cluster/options.nix` (the `coredns` block) and `flakeModules/cluster/lower.nix` (`corednsConfig`): mirror the option.
- `checks/addon-manifests.nix`: assert that the Corefile carries `autopath` and `pods verified` when the option is set.

The ClusterRole already lists and watches `pods`, so no RBAC change is needed.

Until cairn grows the option, nixos can set the whole Corefile through `services.coredns.corefile` in `clan/rosequartz-cluster.nix`.

### 2. nixos: turn it on

Set `services.coredns.autopath = true` in `clan/rosequartz-cluster.nix`, after bumping the cairn input.
Leave `modules/dns`'s routing-only `~thecluster.lan` as is.
A real search domain there would reach every pod's search list.
With the pihole module's `thecluster.lan` wildcard, it could also turn `github.com` into `github.com.thecluster.lan` → the gateway, if CoreDNS ever forwarded that zone to a pihole.

### 3. Verify

- Check `/etc/resolv.conf` in a fresh `ClusterFirst` pod with no `spec.dnsConfig`: three search entries, `ndots:5`.
  Some workloads here override ndots (see Pitfalls), so do not pick an arbitrary existing pod.
- Check that `coredns_autopath_success_total` rises.
- In an Alpine pod, resolve `github.com` through musl's `getaddrinfo(3)`, e.g. `getent hosts github.com`, and check the CoreDNS log: one query pair, not four.
  Do not use BusyBox `nslookup`: it skips the search list for any name containing a dot, so it never produces the fan-out being measured.

### 4. the-cluster: only if a namespace still needs it

Do not add a cluster-wide ndots policy.
If a namespace's musl workloads need fewer queries than autopath gives them, add an opt-in policy under `infrastructure/configs/dns-ndots/`, wired like `nested-containers`.
It needs a `Kustomization` in `clusters/rosequartz/infrastructure.yaml`.
The binding matches namespaces labelled `thecluster.lan/ndots: "2"`, and only pods without their own `dnsConfig`.
This is an untested sketch:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingAdmissionPolicy
metadata:
  name: dns-ndots
spec:
  failurePolicy: Ignore
  reinvocationPolicy: Never
  matchConstraints:
    resourceRules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        operations: ["CREATE"]
        resources: ["pods"]
  matchConditions:
    - name: cluster-first
      expression: object.spec.?dnsPolicy.orValue("ClusterFirst") in ["ClusterFirst", "ClusterFirstWithHostNet"]
    - name: no-dns-config
      expression: "!has(object.spec.dnsConfig)"
  mutations:
    - patchType: JSONPatch
      jsonPatch:
        expression: >-
          [JSONPatch{op: "add", path: "/spec/dnsConfig",
            value: Object.spec.dnsConfig{options: [Object.spec.dnsConfig.options{name: "ndots", value: "2"}]}}]
---
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingAdmissionPolicyBinding
metadata:
  name: dns-ndots
spec:
  policyName: dns-ndots
  matchResources:
    namespaceSelector:
      matchLabels:
        thecluster.lan/ndots: "2"
```

## Pitfalls of lowering ndots

- **musl and `ndots:1`.**
  `data.prod` has one dot, so musl asks only for `data.prod.` and gets NXDOMAIN from 1.1.1.1.
  glibc asks for that and then walks the search list.
  The Kubernetes docs present `data.prod` as the normal cross-namespace form ([dns-pod-service.md](https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/services-networking/dns-pod-service.md), "Namespaces of Services").
- **musl and `ndots:2`.**
  `data.prod` works, and so do bare names.
  `data.prod.svc` breaks, and the-cluster uses that form: `rook-ceph-rgw-s3.rook-ceph.svc`, `keycloak-http.keycloak.svc`, `kube-prometheus-stack-*.monitoring.svc`, and the cloudflared tunnel targets in `infrastructure/configs/cloudflare-system/cloudflare-operator/tunnel.yml`.
  StatefulSet pod names `web-0.web.ns` (two dots) break the same way.
  `web-0.web` (one dot, same namespace) still works.
- **glibc under low ndots.**
  Names keep working, but a name with at least `ndots` dots is tried as absolute first, so it leaks one query upstream before the search list.
  Under `ndots:1` that includes `data.prod.`; under `ndots:2` it is `data.prod.svc.` and the like, while `data.prod` is searched first.
- **Existing overrides.**
  The `deluge` and `qbittorrent` StatefulSets in `apps/media` set `ndots:1`, and `plex` sets `ndots:0`.
  qBittorrent's init container is `python:3.13.3-alpine3.20`.
  Any musl container in those pods cannot resolve `svc.ns` names.
  They appear to use only external names today. That was checked by grep only.
- **NODATA and wildcards stop musl early.**
  A search candidate that answers NOERROR, including a wildcard zone, ends a musl lookup with that answer or with `EAI_NODATA`.
  Never add a search domain with a wildcard behind it.
- **FQDNs are always safe.**
  `data.prod.svc.cluster.local` has four dots, which is under 5, so it is searched first, but the first candidate fails fast.
  With a trailing dot it is exact under any ndots.

## Sources

- musl: [lookup_name.c](https://git.musl-libc.org/cgit/musl/plain/src/network/lookup_name.c), [resolvconf.c](https://git.musl-libc.org/cgit/musl/plain/src/network/resolvconf.c), [res_msend.c](https://git.musl-libc.org/cgit/musl/plain/src/network/res_msend.c), [lookup_name.c log](https://git.musl-libc.org/cgit/musl/log/src/network/lookup_name.c), [functional differences from glibc](https://wiki.musl-libc.org/functional-differences-from-glibc.html)
- musl list: [2016/01/29/3](https://www.openwall.com/lists/musl/2016/01/29/3) (search committed), [2017/03/15/3](https://openwall.com/lists/musl/2017/03/15/3) (NODATA stops search), [2026/08/23/1](https://openwall.com/lists/musl/2026/08/23/1) and [2026/08/23/11](https://openwall.com/lists/musl/2026/08/23/11) (A/AAAA NXDOMAIN, Felker)
- Alpine: [pkgs.alpinelinux.org musl](https://pkgs.alpinelinux.org/packages?name=musl&branch=&repo=main&arch=x86_64)
- glibc: [resolv.conf(5)](https://man7.org/linux/man-pages/man5/resolv.conf.5.html)
- Kubernetes v1.37.1: [dns.go](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubelet/network/dns/dns.go), [validation.go](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/apis/core/validation/validation.go#L4248-L4252), [kubelet config types.go](https://github.com/kubernetes/kubernetes/blob/v1.37.1/staging/src/k8s.io/kubelet/config/v1beta1/types.go#L515-L520), [core/v1 types.go](https://github.com/kubernetes/kubernetes/blob/v1.37.1/staging/src/k8s.io/api/core/v1/types.go#L5303-L5335), [kube_features.go](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/features/kube_features.go#L2428-L2432), [plugins.go](https://github.com/kubernetes/kubernetes/blob/v1.37.1/pkg/kubeapiserver/options/plugins.go#L164-L192), [issue 56903](https://github.com/kubernetes/kubernetes/issues/56903)
- Kubernetes docs: [DNS for Services and Pods](https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/services-networking/dns-pod-service.md), [Debugging DNS Resolution](https://github.com/kubernetes/website/blob/main/content/en/docs/tasks/administer-cluster/dns-debugging-resolution.md), [NodeLocal DNSCache](https://github.com/kubernetes/website/blob/main/content/en/docs/tasks/administer-cluster/nodelocaldns.md), [MutatingAdmissionPolicy](https://github.com/kubernetes/website/blob/main/content/en/docs/reference/access-authn-authz/mutating-admission-policy.md), [feature gate](https://github.com/kubernetes/website/blob/main/content/en/docs/reference/command-line-tools-reference/feature-gates/MutatingAdmissionPolicy.md)
- CoreDNS (`master`, read 2026-10-28): [autopath README](https://github.com/coredns/coredns/blob/master/plugin/autopath/README.md), [autopath.go](https://github.com/coredns/coredns/blob/master/plugin/autopath/autopath.go), [kubernetes README](https://github.com/coredns/coredns/blob/master/plugin/kubernetes/README.md), [kubernetes/autopath.go](https://github.com/coredns/coredns/blob/master/plugin/kubernetes/autopath.go), [object/pod.go](https://github.com/coredns/coredns/blob/master/plugin/kubernetes/object/pod.go)
- nixpkgs (`nixos-unstable`, read 2026-10-28): [kubelet.nix](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/services/cluster/kubernetes/kubelet.nix), [apiserver.nix](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/services/cluster/kubernetes/apiserver.nix), [resolved.nix](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/system/boot/resolved.nix), [network-interfaces.nix](https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/tasks/network-interfaces.nix)
- Policy engines: [Kyverno add-ndots](https://kyverno.io/policies/other/add-ndots/add-ndots), [Gatekeeper mutation](https://open-policy-agent.github.io/gatekeeper/website/docs/mutation/)
