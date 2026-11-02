# Deploying and configuring the arrs as code

Research for [the-cluster#4821](https://github.com/UnstoppableMango/the-cluster/issues/4821): how to run Prowlarr, Sonarr, Radarr and Bazarr (and optionally FlareSolverr/Byparr, Lidarr, Seerr) on rosequartz with Flux, and how much of their configuration can be declared.

Researched 2026-11-02.
Sources are project repositories read at their current `HEAD` or release tag, the Servarr wiki's source repository ([Servarr/Wiki](https://github.com/Servarr/Wiki) at `477b14f`, 2026-11-02), and chart and image repositories.
`wiki.servarr.com` itself refused the research proxy, so wiki pages are cited by their path in that repository, which is what the site renders.
Anything not traced to a source is marked **unverified** or **inference**.

## Conclusions

1. **Images.** Use `ghcr.io/home-operations/*` only if you accept the develop branch: its Sonarr, Radarr, Prowlarr and Lidarr images are built *only* from develop (Sonarr v5, Radarr v7 today).
   For stable releases, `lscr.io/linuxserver/*` is the only image set that is stable, multi-arch, and documents read-only and non-root support. Its `-lsNNN` tags need a Renovate `regex` versioning rule, or Renovate never proposes an update.
   hotio's tags are mutable, and its init needs root.
2. **Packaging.** bjw-s `app-template` 5.3.0 is maintained, renders `HTTPRoute`s and `ExternalSecret`s, and is what both reference home-ops clusters use. k8s-at-home charts were archived in 2022.
   Raw manifests, as `apps/media` uses now, cost roughly one Deployment, Service, HTTPRoute and PVC per app. That is fine for four to seven apps and keeps the repo's single style.
3. **Config as code.** All four Servarr apps override every `config.xml` key from `<APP>__<SECTION>__<KEY>` env vars, which covers the API key, auth method, URL base and Postgres.
   Everything else (root folders, download clients, indexers, profiles, app links) lives in the database and has to be pushed over the API. **Configarr** (active, weekly releases) covers the widest set, including Prowlarr apps, indexers and download clients. **Recyclarr** (active) covers only TRaSH quality profiles, custom formats and naming for Sonarr and Radarr. **Buildarr** has been dormant since May 2024.
4. **Databases.** SQLite on an RBD claim (`fast-rwo`/`standard-rwo`) is the supported default and is what both reference clusters run. Never put SQLite on CephFS (`*-rwx`).
   Postgres via CNPG works for Sonarr, Radarr, Prowlarr, Lidarr, Bazarr and Seerr. Each Servarr app needs two pre-created databases, the app does not back them up, and migrating an existing SQLite database is unsupported.
5. **Resources.** No project publishes steady-state figures. Peer clusters set 10–100m CPU and 128Mi–1Gi requests, with 512Mi–4Gi memory limits.
   Start at about 50m/256Mi with a 1Gi limit for Sonarr and Radarr, and smaller for Prowlarr and Bazarr. Then resize from Prometheus after a week, per `AGENTS.md`.

## 1. Container images

None of Sonarr, Radarr, Prowlarr or Lidarr publishes an official image: "The Sonarr team does not offer an official Docker image" ([Servarr/Wiki `sonarr/installation/docker.md`](https://github.com/Servarr/Wiki/blob/master/sonarr/installation/docker.md)), which lists hotio and linuxserver.
Seerr, FlareSolverr and Byparr do publish their own images.

### Current upstream versions (git tags, 2026-11-02)

| App | Stable branch / latest stable tag | Develop / pre-release |
| --- | --- | --- |
| Sonarr | `main` → `v4.0.20.3014` (2026-09-09) | `develop` → `v5.0.0.2907` (2026-10-31) |
| Radarr | `master` → `v6.4.4.10684` (2026-09-13) | `develop` → `v7.0.0.10815` (2026-10-25) |
| Prowlarr | `master` → `v2.7.0.5723` (2026-10-26) | same |
| Lidarr | `master` → `v3.1.6.5078` (2026-09-13) | `v3.2.0.5144` (2026-10-25) |
| Bazarr | `master` → `v1.6.2` | `v1.6.3-beta.24` (2026-11-02) |
| Seerr | `v3.5.1` (2026-10-21) | — |
| FlareSolverr | `v3.5.2` (2026-09-12) | — |
| Byparr | `v3.0.4` (2026-08-18) | — |

(Source: `git for-each-ref refs/tags` and `git describe` on each repository's stable branch.)

### Comparison

| | linuxserver.io (`lscr.io/linuxserver/<app>`) | hotio (`ghcr.io/hotio/<app>`) | home-operations (`ghcr.io/home-operations/<app>`) |
| --- | --- | --- | --- |
| Branch built | Stable (Sonarr `SONARR_BRANCH="main"`, channel `v4-stable`); develop under `develop-*` tags | `release` = stable (`"version_branch": "main"`), `nightly` = develop | **develop only** for Sonarr, Radarr, Prowlarr and Lidarr (`SONARR__UPDATE__BRANCH=develop`, `datasource=custom.servarr-develop`); Bazarr tracks GitHub releases |
| Tag scheme | `4.0.20.3014-ls2`: app version plus `-lsN` build counter | `release`, `release-4.0.20.3014`, `release-<sha7>`; the version tag is re-pointed on every rebuild | `5.0.0.2907`, which the project says is not immutable; pin `@sha256` |
| arm64 | Yes (`arm64v8-latest` in `readme-vars.yml`) | Yes (`linux-arm64.Dockerfile`) | Yes (`linux/amd64`, `linux/arm64` in `docker-bake.hcl`) |
| Base / init | Alpine + s6-overlay; starts as root, drops to `abc` | Alpine + s6-overlay; init runs `usermod` to apply `PUID`, so it needs root | Alpine + `catatonit`; `USER nobody:nogroup` (65534) |
| Non-root | `nonroot_supported: true` for Sonarr, Radarr, Prowlarr, Bazarr and Lidarr; PUID/PGID, mods and custom services are disabled | No documented rootless path | Default |
| `readOnlyRootFilesystem` | `readonly_supported: true` for the same five; needs `/run` as an exec tmpfs | Not documented | Supported; mount an `emptyDir` at `/tmp` |
| Postgres libs | `krb5-libs` added 2026-10-19 "for better postgresql support" | — | `krb5-libs` included |

Sources:
- linuxserver: [`docker-sonarr` Dockerfile and `readme-vars.yml`](https://github.com/linuxserver/docker-sonarr), the `readme-vars.yml` of `docker-{radarr,prowlarr,bazarr,lidarr}`, [Read-only](https://docs.linuxserver.io/misc/read-only/) and [Non-root](https://docs.linuxserver.io/misc/non-root/) docs.
- hotio: [`hotio/sonarr` `meta.json` and Dockerfiles](https://github.com/hotio/sonarr), [`hotio/base` `build-on-call.yml` (tag scheme)](https://github.com/hotio/base/blob/workflows/.github/workflows/build-on-call.yml), the `init-setup/run` in `hotio/base@alpinevpn`, and [hotio.dev/containers/sonarr](https://hotio.dev/containers/sonarr/).
- home-operations: [README](https://github.com/home-operations/containers) ("Prowlarr, Radarr, Lidarr, and Sonarr only publish the develop branch"; "do not use immutable tags in the traditional sense … pinning to the sha256 digest"), and `apps/{sonarr,radarr,bazarr}/{Dockerfile,docker-bake.hcl}`.

What linuxserver's two modes switch off, from its docs:
- **Read-only.** "you must also mount `/run` to tmpfs with the `exec` flag set". With it, "PUID & PGID variables will not have any effect", and mods and custom services do not run.
- **Non-root.** Start with `--user`; you must "manually manage the permissions of any mounted volumes".

In Kubernetes terms, set `runAsUser`/`runAsGroup`/`fsGroup` and mount an `emptyDir` (medium `Memory`) at `/run`. The repo's Deluge and qBittorrent images already come from linuxserver.

### Renovate fit

- **Default `docker` versioning cannot follow linuxserver tags.** Renovate splits a tag at the first hyphen and treats the rest as a compatibility suffix, and `isCompatible` requires `parsed1.suffix === parsed2.suffix` ([`lib/modules/versioning/docker/index.ts`](https://github.com/renovatebot/renovate/blob/main/lib/modules/versioning/docker/index.ts)).
  `4.0.20.3014-ls329` and `4.0.21.x-ls330` are therefore incompatible, and no update is proposed.
  This repo has no rule for it: neither `.github/renovate.json` nor `UnstoppableMango/renovate-config` mentions `lscr`/`linuxserver`, and Renovate's built-in `workarounds` preset has none either. The existing `deluge:2.2.0-ls371` and `qbittorrent:5.1.4-r2-ls448` pins are probably not being bumped (**inference**; the history in this checkout is grafted, so it could not be confirmed).
  The fix is a `packageRules` entry with `versioning: "regex:^(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)\\.(?<build>\\d+)-ls(?<revision>\\d+)$"` per image shape.
- **linuxserver's build counter can reset.** `docker-sonarr` went from `4.0.20.3014-ls329` (2026-10-15) to `4.0.20.3014-ls1` (2026-10-20) at the `krb5-libs` change.
  Regex versioning would then treat `-ls1` as older than `-ls329`, so rebuilds of the same app version are missed until the next app release (**inference** from the tag list; the cause of the reset is not documented).
- **hotio** `release-4.0.20.3014` parses with docker versioning only if the `release-` prefix is stripped, using `extractVersion`/`versioning: regex`. Because the tag is re-pointed on rebuilds, a digest pin is needed for immutability.
- **home-operations** tags are plain versions with a digest, which is the shape Renovate handles best. But they track develop.

## 2. Packaging

| Option | Status | Notes |
| --- | --- | --- |
| Raw manifests (current `apps/media` style) | n/a | Matches every other media app here. Per app: Deployment or StatefulSet, Service, HTTPRoute, PVC and, for secrets, a SealedSecret or ExternalSecret. No chart to track. |
| bjw-s [`app-template`](https://github.com/bjw-s-labs/helm-charts) | `app-template-5.3.0` / `common-5.3.0`, 2026-10-10 | Helm repo `https://bjw-s-labs.github.io/helm-charts` and OCI `oci://ghcr.io/bjw-s-labs/helm`. Values include `controllers`, `route` (Gateway API, with automatic ReferenceGrant), `externalSecrets`, `persistence`, `networkpolicies` and `rawResources` (`charts/library/common/values.yaml`). Ships a JSON schema for `HelmRelease` values. Used by both reference clusters below. |
| k8s-at-home charts | Archived; last tags 2022-08 | README: "This repo is being deprecated". Do not use. |
| TrueCharts | Active, distributed for their own ClusterTool/Flux flow | Not evaluated in depth: the charts depend on TrueCharts' common library and conventions (**unverified** for this cluster). |
| Seerr's official chart | `seerr-chart` 3.10.1, appVersion v3.5.1 | `helm install seerr oci://ghcr.io/seerr-team/seerr/seerr-chart`, signed. Defaults: `runAsNonRoot: true`, UID 1000, `readOnlyRootFilesystem: false` ([`charts/seerr-chart`](https://github.com/seerr-team/seerr/tree/develop/charts/seerr-chart)). |

Neither Sonarr, Radarr, Prowlarr, Lidarr nor Bazarr ships a chart.

### Fit with `the-cluster` conventions (`AGENTS.md`)

- **Resources: CPU request, memory request and memory limit on every container.**
  Both reference clusters set a memory *limit* without a memory *request* (onedr0p: `requests.cpu: 100m`, `limits.memory: 4Gi`), which is the exact trap `AGENTS.md` warns about. Whatever packaging is chosen, write the requests explicitly.
  With app-template, every sidecar or init container (for example a `postgres-init` initContainer) needs its own `resources`.
- **Storage classes.** Config PVCs go on `fast-rwo` or `standard-rwo` (RBD). The existing media claims are `bulk-rwx` plus the deprecated `default-cephfs`/`ec-cephfs`.
- **Renovate grouping rule.** It applies to app-template only loosely: the chart is generic, so there is no chart/app version pair to group. Renovate bumps the chart and each image independently.
- **Secrets.** A stub under `hack/secrets/apps/media/...` for each SealedSecret. Alternatively, an `ExternalSecret` against the Azure Key Vault `ClusterSecretStore` in `infrastructure/configs/external-secrets-system`, with the Kustomization depending on `infra-configs-external-secrets`.
- **Auth precedent.** `apps/deemix/helm-release.yml` already fronts an app with an `oauth2-proxy` sidecar against Keycloak (`OAUTH2_PROXY_PROVIDER: keycloak-oidc`). That is the model for `AUTH__METHOD=External` (§3).

### Hardlinks and the current volume layout

Sonarr and Radarr import a finished torrent by hardlinking when "the torrent download folder and the library folder will be on the same file system and *look like it*". Otherwise they copy ([Servarr/Wiki `sonarr/faq.md`](https://github.com/Servarr/Wiki/blob/master/sonarr/faq.md)).
The download claims (`deluge-downloads` and `qbittorrent-downloads`, both `ec-cephfs`) and the library claims (`tv`, `movies`, … on `bulk-rwx`) are separate PVCs, so they are separate mounts in the pod.
`link(2)` "does not work across different mount points, even if the same filesystem is mounted on both" ([man 2 link](https://man7.org/linux/man-pages/man2/link.2.html), `EXDEV`).
So every import will be a full copy unless downloads and library share one claim. This is out of scope for #4821 but decides disk use.

## 3. Configuration as code

### What each app reads at startup

**Sonarr, Radarr, Prowlarr, Lidarr.**
`Bootstrap.cs` binds `config.GetSection("Sonarr:Auth")` etc. to options classes, and `ConfigFileProvider` prefers the option over `config.xml` (`_authOptions.ApiKey ?? GetValue("ApiKey", …)`).
The env form is `<APP>__<SECTION>__<KEY>`, with sections `APP`, `AUTH`, `LOG`, `POSTGRES`, `SERVER` and `UPDATE`.
Sources: [Servarr/Wiki `sonarr/environment-variables.md`](https://github.com/Servarr/Wiki/blob/master/sonarr/environment-variables.md) and the same page for radarr, prowlarr and lidarr; `src/NzbDrone.Host/Bootstrap.cs` and `src/NzbDrone.Core/Configuration/ConfigFileProvider.cs` at each stable tag.

Options present at the **stable** tags (Sonarr v4.0.20.3014, Radarr v6.4.4.10684, Prowlarr v2.7.0.5723, Lidarr v3.1.6.5078):

| Concern | Variable (Sonarr shown; prefix varies) | Notes |
| --- | --- | --- |
| API key | `SONARR__AUTH__APIKEY` | `SaveConfigDictionary` skips `ApiKey`, so the UI cannot overwrite it. A Secret-sourced key is stable across restarts, which is what Prowlarr, Bazarr, Seerr and Configarr need. |
| Auth method | `SONARR__AUTH__METHOD` = `Forms` / `External` (`Basic` is obsolete; `None` is invalid since v4) | `External` trusts whatever sits in front, such as oauth2-proxy. |
| Auth required | `SONARR__AUTH__REQUIRED` = `Enabled` / `DisabledForLocalAddresses` | |
| URL base | `SONARR__SERVER__URLBASE` | Not needed with one hostname per app. |
| Port, bind, allowed hosts | `SONARR__SERVER__PORT`, `…__BINDADDRESS`, `…__ALLOWEDHOSTS` | |
| Postgres | `SONARR__POSTGRES__{HOST,PORT,USER,PASSWORD,MAINDB,LOGDB}` | Default DB names `<app>-main` and `<app>-log`. |
| Postgres connection string | `…__POSTGRES__MAINDBCONNECTIONSTRING` / `…LOGDBCONNECTIONSTRING` | Radarr, Prowlarr and Lidarr stable have it. **Sonarr v4 does not** (only v5/develop). It cannot be mixed with the host/user form. This is the only way to pass Npgsql TLS client-cert parameters, as `apps/wishlists` uses for CNPG (**inference**: Npgsql option names not verified against each app). |
| Log DB | `SONARR__LOG__DBENABLED=False` | Both reference clusters disable the log DB. |
| Updates | `SONARR__UPDATE__BRANCH`, `…__MECHANISM` | Images already set `UpdateMethod=docker` in `package_info`. |

Not in env:
- **The Forms user and password.** They are stored in the database's `Users` table, so Forms auth always needs one UI or API step.
  linuxserver's changelog for Sonarr v5 says "New v5 installs will write initial credentials to container log" (2026-10-12).
- **OIDC.** `AuthenticationType.Oidc = 4`, with `AUTH__OIDCAUTHORITY`, `…OIDCCLIENTID`, `…OIDCCLIENTSECRET` and `…OIDCSCOPES`, landed as "New: OIDC authentication" in Sonarr (2026-09-15, first in `v5.0.0.2569`) and Radarr (2026-10-18, `v7.0.0.10815`).
  It is **develop-only** today, and is absent from Prowlarr and Lidarr.
  Once stable, it would let the apps authenticate against the cluster's Keycloak directly, with no oauth2-proxy.

**Bazarr** (`bazarr/app/config.py`, `bazarr/app/database.py` at `v1.6.2`):
- Config is `config/config.yaml`, loaded by Dynaconf and rewritten by `write_config()`, so it must be writable. A ConfigMap mount will not work. Seed it with an initContainer.
- `auth.apikey` defaults to a random value, and `auth.type` is `None`, `basic` or `form`.
- The Sonarr and Radarr link details (`sonarr.apikey`, `sonarr.base_url`, …) live in the same file.
- The only env vars read explicitly are Postgres: `POSTGRES_ENABLED`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USERNAME`, `POSTGRES_PASSWORD` and `POSTGRES_URL`.
- Dynaconf's default env loader (prefix `DYNACONF_`) may allow other overrides, but it is **unverified**: `core_loaders=['YAML']` is set, and nothing in Bazarr documents it.

**Seerr** ([`docs/extending-seerr/database-config.mdx`](https://github.com/seerr-team/seerr/blob/develop/docs/extending-seerr/database-config.mdx)):
- DB settings: `DB_TYPE=postgres`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (default `seerr`), `DB_POOL_SIZE` and an SSL section.
- Other settings live in `config/settings.json`, written by the app (**unverified** whether env overrides exist for the API key).
- Seerr is the merged Overseerr/Jellyseerr project; the tag `v2.7.3-deprecated` marks the old line.

**FlareSolverr / Byparr.**
- Both are stateless and env-only (`LOG_LEVEL`, `PORT`; Byparr also takes `PROXY_SERVER`, `BROWSER_LOCALE` and `BROWSER_TIMEZONE`).
- They need no config as code beyond Prowlarr's indexer-proxy entry.

### Tools that drive the rest through the APIs

| Tool | Latest release | Maintained? | Scope |
| --- | --- | --- | --- |
| [Configarr](https://github.com/raydak-labs/configarr) | v1.38.0, 2026-10-26 (v1.35–1.38 within two weeks) | Yes | **Sonarr v4/v5 and Radarr v5–v7**: TRaSH and own custom formats and CF groups, quality profiles, quality definitions, naming, root folders, delay and release profiles, import lists, metadata, tags, download clients, remote path mappings and general settings. **Prowlarr (experimental, since v1.31.0)**: tags, sync profiles, indexer proxies (FlareSolverr), indexers, applications (Sonarr/Radarr links with `sync_level: fullSync`) and download clients. Lidarr, Readarr and Whisparr are experimental. Secrets come in via `!env`/`!secret`/`!file`. Docs give a Kubernetes **CronJob** and an app-template example; there is no chart. `delete_unmanaged` defaults off, and `DRY_RUN=true` is available. |
| [Recyclarr](https://github.com/recyclarr/recyclarr) | v8.8.1, 2026-10-28 | Yes | Sonarr (v4+, v5 since 8.8.0) and Radarr only. TRaSH quality profiles, custom formats (and groups), quality definitions, naming and propers/repacks media management. No root folders, download clients, indexers or Prowlarr. There is no `latest` tag; pin the major (`8`). |
| [Buildarr](https://github.com/buildarr/buildarr) | v0.7.1 (2023-11); `v0.8.0b1` (2024-04) | **No**: last commit 2024-05-05 | Plugin-based; would cover Sonarr, Radarr and Prowlarr if it worked against current APIs. Not a candidate. |
| [PrepArr](https://github.com/robbeverhelst/Preparr) | v0.19.10, 2026-10-11 | Active, single maintainer | Init container plus sidecar per app. It creates the Postgres DBs, writes `config.xml`, sets API keys, and applies JSON config (download clients, indexers, quality profiles, Bazarr providers). **Requires Postgres** ("SQLite not supported"). Overlaps with CNPG and Configarr; it would add a third moving part. |
| Prowlarr app sync | built in | — | Prowlarr pushes its indexers to Sonarr, Radarr, Lidarr and others. `Full Sync` "will keep this app's indexers fully in sync … Any change made … remotely within this app will be overridden by Prowlarr on the next sync" ([Servarr/Wiki `prowlarr/settings.md`](https://github.com/Servarr/Wiki/blob/master/prowlarr/settings.md)). So indexers are declared once, in Prowlarr, and Configarr can declare the Prowlarr → app links themselves. |

A fully declarative layering would be:

1. **Kubernetes.** Env vars cover the API key, auth, port and DB.
2. **Configarr CronJob.** Covers everything inside Sonarr and Radarr, plus Prowlarr's apps, proxies and indexers.
3. **Prowlarr Full Sync.** Fans the indexers out to the apps.

That leaves out:
- the Forms user, unless `External` auth is used;
- Bazarr's Sonarr/Radarr links and providers. These sit in `config.yaml`, so seed them with an initContainer, or use PrepArr's Bazarr support.
- Seerr's server and app links, which are UI only (**unverified**).

## 4. Databases

### SQLite

- Default for every app.
- The Servarr FAQ says the AppData folder "MUST be on local storage. SQLite and network drives not play nice together and will cause a malformed database eventually" ([Servarr/Wiki `sonarr/faq.md`, "Database disk image is malformed"](https://github.com/Servarr/Wiki/blob/master/sonarr/faq.md)), citing [sqlite.org/useovernet](https://www.sqlite.org/useovernet.html).
- On rosequartz:
  - **CephFS classes** (`standard-rwx`, `bulk-rwx`, and deprecated `ec-cephfs`/`default-cephfs`) are network filesystems, so never use them for `/config`.
  - **RBD classes** (`fast-rwo`, `standard-rwo`) are block devices with a local filesystem on one node. SQLite locking stays in-kernel, so they are fine (**inference**, consistent with the FAQ's "local storage").
  - `ReadWriteOncePod` plus `strategy: Recreate` keeps two pods from opening the file, as `copyparty-hists` already does.
- Both reference clusters (onedr0p, bjw-s) run SQLite on an `existingClaim` with `readOnlyRootFilesystem: true`.
- Backups: the apps write scheduled zip backups into `/config/Backups`. Velero snapshots of the RBD claim also cover it.

### Postgres

| App | Postgres? | Since | DBs | Source |
| --- | --- | --- | --- | --- |
| Sonarr | Yes | v4.0.0.615 | `sonarr-main` and `sonarr-log`; "Sonarr will not create the databases for you" | [`sonarr/postgres-setup.md`](https://github.com/Servarr/Wiki/blob/master/sonarr/postgres-setup.md) |
| Radarr | Yes | v4.1.0.6133 | `radarr-main`, `radarr-log` | [`radarr/postgres-setup.md`](https://github.com/Servarr/Wiki/blob/master/radarr/postgres-setup.md) |
| Prowlarr | Yes | (not stated) | `prowlarr-main`, `prowlarr-log` | [`prowlarr/postgres-setup.md`](https://github.com/Servarr/Wiki/blob/master/prowlarr/postgres-setup.md) |
| Lidarr | Yes | v1.1.2.2890 | `lidarr-main`, `lidarr-log` | [`lidarr/postgres-setup.md`](https://github.com/Servarr/Wiki/blob/master/lidarr/postgres-setup.md) |
| Bazarr | Yes (env or `postgresql:` block) | in v1.6.2 | one | `bazarr/app/database.py` |
| Seerr | Yes | — | one (`seerr`) | `database-config.mdx` |
| FlareSolverr / Byparr | stateless | — | — | — |

All four Servarr pages say:
- Npgsql "supports all currently supported PostgreSQL versions (PostgreSQL 14 through 18)". For Postgres 18 or later, "start with a fresh database".
- "Postgres databases are NOT backed up by Sonarr, any backups must be implemented and maintained by the user".
- "Migrating an existing sqlite3 database is unsupported … We support only new installs using postgres". There is a best-effort pgloader recipe.

With CNPG (operator chart 0.29.1 / CNPG 1.30.1 here, already used by `apps/wishlists` and `apps/nextcloud`):
- `bootstrap.initdb` creates one database. The second one (`-log`) needs a declarative `Database` resource ([CNPG `declarative_database_management.md`](https://github.com/cloudnative-pg/cloudnative-pg/blob/main/docs/src/declarative_database_management.md)), or `LOG__DBENABLED=False` so only `-main` is used (**unverified** whether the log DB is still opened when disabled).
- One CNPG Cluster shared by all the apps keeps the pod count down. Per-app roles come from `managed.roles` and `Database` CRs.
- Credentials: CNPG generates `<cluster>-app` Secrets per bootstrap owner. For additional roles you supply the password Secret.
- Wishlists' client-cert auth only works for apps that accept a connection string. That rules out Sonarr v4.

**Trade-off.**
- Postgres removes SQLite's single-writer locking and the network-FS hazard, and gives PITR via CNPG backups.
- It also adds a cluster dependency: an outage of the CNPG Cluster stops every arr at once.
- For a single household's library, SQLite on `fast-rwo` is the lower-risk default, and both reference clusters chose it.
- Postgres is mainly worth it if PrepArr is adopted (which requires it) or if central backups are wanted.

## 5. Steady-state resources

No project publishes measured usage. FlareSolverr's README warns "Web browsers consume a lot of memory", and Lidarr's import guide says large-library imports are "RAM- and compute-intensive".
What two maintained reference clusters set (`HelmRelease`s read at `HEAD`, 2026-11-02):

| App | onedr0p/home-ops | bjw-s-labs/home-ops |
| --- | --- | --- |
| Sonarr | cpu 100m; limit 4Gi (no mem request) | cpu 20m; limit 1Gi (no mem request) |
| Radarr | cpu 100m; limit 4Gi | cpu 20m; limit 1Gi |
| Prowlarr | cpu 100m; limit 1Gi | cpu 18m; req 128Mi; limit 512Mi |
| Bazarr | cpu 10m; limit 1Gi | cpu 15m; req 256Mi; limit 512Mi |
| Seerr | cpu 10m; limit 2Gi | — |
| Recyclarr | cpu 10m; limit 128Mi | cpu 5m; req 36M; limit 128M |

These are limits other operators chose, not measurements. Suggested starting points under `AGENTS.md`'s rule (requests floored at 10m and 32Mi; limits 2–3× peak), to be replaced with Prometheus numbers after a week:

| App | CPU req | Mem req | Mem limit |
| --- | --- | --- | --- |
| Sonarr, Radarr | 50m | 256Mi | 1Gi |
| Lidarr | 50m | 256Mi | 1Gi |
| Prowlarr | 20m | 128Mi | 512Mi |
| Bazarr | 20m | 192Mi | 512Mi |
| Seerr | 20m | 192Mi | 1Gi |
| FlareSolverr / Byparr | 20m | 256Mi | 1Gi; mount `/tmp` as a memory `emptyDir` (FlareSolverr README recommends tmpfs) |
| Configarr / Recyclarr CronJob | 10m | 64Mi | 256Mi |

These are **inference**, not measurements. .NET apps grow their heap with library size, so watch Sonarr and Radarr after the first full library scan.
Every image here is multi-arch, but the media claims and the x86 workers make `kubernetes.io/arch: amd64` the natural placement. Byparr notes ARM is tested only on an Oracle Ampere VM.

## Open questions

- Is it acceptable to run develop builds (home-operations; Sonarr v5 and Radarr v7 for OIDC), or must the stack stay on stable (linuxserver, with a Renovate regex rule)?
- Auth: oauth2-proxy + Keycloak with `AUTH__METHOD=External` (works today), Forms with a bootstrap step, or wait for OIDC to reach stable?
- Should downloads and the library move onto one claim so imports hardlink instead of copying (§2)?
