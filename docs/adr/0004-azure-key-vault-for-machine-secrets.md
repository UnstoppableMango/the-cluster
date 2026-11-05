# Azure Key Vault is the one store for machine secrets

Every secret a rosequartz workload uses has one source of truth: Azure Key Vault, read into the cluster by external-secrets.
SealedSecrets, Pulumi config, GitHub and Bitwarden stop being places a secret lives, and nobody copies a secret from one system into another.

rosequartz gets vaults of its own rather than sharing `unstoppablemango-pulumi`, which keeps Pulumi's own state passphrase out of reach of any cluster identity.
control-plane is the platform layer: it creates every rosequartz vault, every identity, and every role assignment.
A program that creates a secret (iam's Keycloak clients, control-plane's B2 keys and Cloudflare tokens) holds Key Vault Secrets Officer on its own vault and writes the secret there itself.
The cluster's identity holds only Key Vault Secrets User.

## Considered options

- **OpenBao on a NixOS host.** Its external-secrets provider is just as stable, its path policies are finer-grained, and it is the only option that rebuilds the cluster with the internet down.
  It was rejected because it adds a host, an unseal design and backups to operate, and offline rebuild is not a requirement.
- **Bitwarden Secrets Manager and Infisical Cloud.** Both external-secrets providers are alpha, neither lets external-secrets authenticate without a stored token, and their free tiers cap the per-consumer identities this design needs.
- **SOPS in git, decrypted by Flux.** It has no PushSecret and Pulumi cannot write to it, so it fails "the program that creates a secret writes it". It survives only as the format of the break-glass copy.

## Consequences

- A restart while Azure is unreachable is harmless: external-secrets keeps existing Secrets and retries.
  A rebuild from an empty etcd needs Azure.
  An age-encrypted break-glass copy of the secrets a rebuild cannot proceed without (the cluster CA, Rook's mon secret and fsid, the sealed-secrets key, the Cloudflare tunnel credentials and the other backup-critical secrets) is kept as a clan var in nixos, so losing Azure costs time, never data.
- Workload identity through Entra replaces the sealed service-principal credential once the apiserver signs with the public issuer, and once its ES256 tokens are acceptable to Entra.
- Bitwarden remains a one-way, human-facing view written from the store; it is never read by a workload.
- The one exception is intake, decided in #4847: a manual producer may file a secret that only a web page can issue in Bitwarden's `Intake` collection, and the view's automation moves it into the store once and deletes the intake copy.
  Nothing else in Bitwarden is ever read back, and the automation can write only to the vault that holds manual producers' secrets.
