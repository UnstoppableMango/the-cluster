# thecluster-operator is Harbor's only admin and the producer of its credentials

thecluster-operator is the one thing that configures Harbor and the one thing that holds Harbor admin rights.
Other programs, including Pulumi programs, never get a Harbor credential that can create anything.
They request a Registry credential by declaring a CR, in this repo through Flux or with pulumi-kubernetes where they already have cluster access, and the operator writes the result into a Harbor vault that control-plane creates, as the producer ADR 0004 requires.

A credential names one project in its own namespace and `pull` or `push`; nobody gets delete.
It is a Harbor robot that expires after 90 days, and the operator refreshes its secret at 60, which readers never notice because they read from the store.
The operator logs in as a system-level robot, filed once through intake by a manual producer, so its access can be revoked without touching `admin`.

## Considered options

- **Pulumi or Terraform with the Harbor provider in each consumer.** Every consumer would hold a credential able to create projects and robots, and requests would bypass review in this repo.
- **A Kubernetes Secret in the requesting namespace.** Simple for in-cluster readers, but it makes the cluster a second secret store and leaves out-of-cluster programs with nothing to read.

## Consequences

- Our own images arrive as public Replicas pulled from `ghcr.io/unmango`, so CI holds no Harbor credential and nodes and workloads need no pull secret.
  Credentials exist only for private projects and for Pushers.
- The operator needs Key Vault Secrets Officer on the Harbor vault, the only vault it can write to.
