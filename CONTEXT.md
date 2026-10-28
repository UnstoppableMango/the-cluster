# rosequartz

The homelab Kubernetes cluster and the services it hosts for one household.

## Language

### Reaching a service

**Canonical hostname**:
The one name a service is known by, which every client stores and which resolves wherever the client happens to be.
_Avoid_: public URL, LAN URL

**Entry point**:
A path by which traffic reaches the cluster: the LAN, the Cloudflare tunnel, and later Tailscale.
_Avoid_: ingress (overloaded with the Kubernetes kind)

### People

**Household**:
The small, known set of people a service is run for, each with an account declared in Keycloak.
_Avoid_: users, tenants, customers

**Break-glass admin**:
A local administrator account inside a service that works when Keycloak does not.
_Avoid_: root, emergency user
