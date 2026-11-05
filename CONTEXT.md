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

### Secrets

**Secret store**:
The one source of truth for every machine secret a workload uses; workloads read their secrets from it and from nowhere else.
_Avoid_: vault (the name of one store's container), backend

**Producer**:
The program or provider that creates a secret and writes it into the secret store, so no person ever handles the value.
_Avoid_: owner, source

**Manual producer**:
A person acting as the producer for a secret that only a web page can issue, such as a GitHub App key; they write it once, through intake or directly into the secret store, and nowhere else.
_Avoid_: hand-copied, typed in

**Intake**:
The one path by which a value travels from the view into the secret store: a manual producer files it in Bitwarden, automation moves it into the store, and the intake copy is removed.
_Avoid_: reverse sync, two-way sync

**Consumer**:
A workload that reads a secret from the secret store.

**View**:
Bitwarden, holding copies of the human-facing secrets that automation writes there one way; a change made in the view is overwritten by the store.
_Avoid_: mirror, sync

**Break-glass copy**:
An offline, encrypted copy of the secrets a rebuild cannot proceed without, kept outside the cluster and the secret store.
_Avoid_: backup (which also means Velero and CNPG backups)
