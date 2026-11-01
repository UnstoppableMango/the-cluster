# nextcloud

Nextcloud for the household at `cloud.thecluster.io`, with Office documents opening in `apps/collabora` at `office.thecluster.io`.
Both names resolve to the nginx Gateway on the LAN and to the Cloudflare tunnel everywhere else (`docs/adr/0002-nextcloud-one-hostname-split-dns.md`).

## Logging in

Everyone logs in through Keycloak once the `nextcloud-oidc` Secret exists (`client-id`, `client-secret`, from the client declared in UnstoppableMango/iam).
The `before-starting` hook in `helm-release.yml` configures the provider on the next pod start; until then it is skipped.
Members of Keycloak's `nextcloud-admins` group must reach Nextcloud with `admin` in their `groups` claim, which the client's mapper in `iam` arranges.

The break-glass admin is local, in `nextcloud-admin`, and works when Keycloak does not:

```sh
kubectl -n nextcloud get secret nextcloud-admin -o jsonpath='{.data.nextcloud-password}' | base64 -d
```

## Backups

Velero's daily schedules take both claims in `pvcs.yml`, and the database's instance volumes, to Backblaze and the in-cluster store.
The database snapshot is only crash-consistent, which Postgres recovers from like a power cut; point-in-time restore waits on CNPG backing up through the Barman Cloud plugin.

The file and database backups are not taken at the same instant, so a restore can find rows for files that are gone, or files with no rows.
After restoring either, rescan:

```sh
kubectl -n nextcloud exec deploy/nextcloud -c nextcloud -- su -s /bin/sh www-data -c 'php occ files:scan --all'
```

## Upgrades

Nextcloud cannot skip a major version, and the image's entrypoint runs `occ upgrade` against whatever version it is given.
Renovate opens one PR per major and never automerges it (`.github/renovate.json`).
Before merging one, take a Velero backup of the namespace and wait for it to finish:

```sh
velero backup create nextcloud-pre-upgrade --include-namespaces nextcloud --snapshot-move-data --wait
```

A failed upgrade is not rolled back by Helm, because the database may already be migrated.
Restore from that backup instead.
unmango/thecluster-operator#156 tracks moving this sequence into an operator.

## A failed first install

The image's entrypoint installs Nextcloud only on the first start, while `version.php` is missing from `nextcloud-app`, and copies that file in before installing.
If the install fails, no later start retries it, and the `before-starting` hook stops every one of them with "Nextcloud is not installed".
The install's error is in the first container's log, and in `data/nextcloud.log` on `nextcloud-data` if it got as far as opening it.

Once the cause is fixed, empty both claims and the database and let the entrypoint install again.
This deletes everything, so it is only for an instance nobody has used yet.
The subshell stops at the first step that fails:

```sh
(
  set -eu
  flux -n nextcloud suspend helmrelease nextcloud
  kubectl -n nextcloud patch cronjob nextcloud-cron -p '{"spec":{"suspend":true}}'
  kubectl -n nextcloud scale deploy/nextcloud --replicas=0
  # The app pod and any running cron job both hold the claims. Finished cron
  # pods stay around for the job history, and hold nothing.
  while kubectl -n nextcloud get pods -l 'app.kubernetes.io/name=nextcloud,app.kubernetes.io/component in (app,cronjob)' \
    --field-selector=status.phase!=Succeeded,status.phase!=Failed -o name | grep -q .; do sleep 2; done
  kubectl apply -f hack/nextcloud-wipe.yml
  kubectl -n nextcloud wait --for=jsonpath='{.status.phase}'=Succeeded pod/nextcloud-wipe --timeout=5m
  kubectl delete -f hack/nextcloud-wipe.yml
  kubectl cnpg -n nextcloud psql postgres -- -d nextcloud -v ON_ERROR_STOP=1 \
    -c 'DROP SCHEMA public CASCADE' -c 'CREATE SCHEMA public AUTHORIZATION pg_database_owner'
  kubectl -n nextcloud patch cronjob nextcloud-cron -p '{"spec":{"suspend":false}}'
  kubectl -n nextcloud scale deploy/nextcloud --replicas=1
  flux -n nextcloud resume helmrelease nextcloud
)
kubectl -n nextcloud logs -f deploy/nextcloud -c nextcloud
```
