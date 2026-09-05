# Removing an ARC runner scale set

Removing an entry from `.spec.values.scaleSets` in `apps/arc-runners/helm-release.yml` can deadlock the
`AutoscalingRunnerSet` finalizer and stall the ARC controller cluster-wide.
Follow the drain procedure below rather than deleting the entry and pushing.

## The finalizer dependency

Every `AutoscalingRunnerSet` carries `autoscalingrunnerset.actions.github.com/finalizer`.
Before the object can be removed, the finalizer resolves the GitHub App credentials named by
`githubConfigSecret` and calls GitHub to deregister the scale set.
Resolution reads a `Secret` in the same namespace as the `AutoscalingRunnerSet`.

If that `Secret` is gone, the finalizer fails:

```
failed to resolve app config: failed to get kubernetes secret: "<namespace>/thecluster-bot"
```

A failed finalizer requeues, and the object retries forever.

## Why the retry is not harmless

`gha-rs-controller` runs with `--runner-max-concurrent-reconciles=2`, the chart default.
The `AutoscalingRunnerSet` and `AutoscalingListener` controllers share those two slots.
A handful of permanently failing finalizers is enough to occupy both slots continuously,
which starves the listener controller and causes listener pods to be recreated across every scale set.
The symptom is cluster-wide: every listener pod under a minute old, zero restarts, a steady pod count.
Only the log lines above identify the namespace actually at fault.

## Why removal triggers it

The layout couples the scale set and its credentials into one namespace:

- `charts/arc-runner-scale-set` renders a `Namespace` per scale set, named by
  `arc-runner-scale-set.namespace` (`arc-<name>` with `.` and `_` folded to `-`).
- The child `HelmRelease` in `arc-runners` deploys the upstream chart into that namespace,
  which creates the `AutoscalingRunnerSet`.
- `hack/arc-fanout-secret.sh` reads the same namespace list back out of `helm template` and emits one
  `SealedSecret` per namespace into `apps/arc-runners/thecluster-bot-sealed.yml`.

Dropping a scale set from values removes all three at once, and nothing orders them:

1. The parent release stops rendering the child `HelmRelease` and the `Namespace`, so Helm deletes both.
2. Regenerating the fanout file drops that namespace's `SealedSecret`, and `prune: true` on the
   `apps-arc-runners` Kustomization deletes it.
3. Deleting the `SealedSecret` garbage-collects the `Secret` it owns, since sealed-secrets sets an
   `ownerReference` on the generated `Secret`.

Namespace termination is a second, independent path to the same race.
It deletes every object in the namespace without regard for the finalizer's dependency on the `Secret`,
so the `Secret` can disappear while the `AutoscalingRunnerSet` is still terminating.

The credentials are needed strictly longer than the scale set is, and nothing in the manifests says so.

## Draining a scale set safely

Take the scale set down before removing its manifests, so the finalizer runs while its `Secret` still exists.

1. Delete the child `HelmRelease` and wait for the `AutoscalingRunnerSet` to disappear:

   ```sh
   kubectl delete helmrelease <name> -n arc-runners
   kubectl wait --for=delete autoscalingrunnerset/thecluster -n arc-<name> --timeout=5m
   ```

   Flux recreates the `HelmRelease` on its next reconcile, so run step 2 promptly.

2. Remove the entry from `.spec.values.scaleSets`, regenerate the fanout file, and push:

   ```sh
   make apps/arc-runners/thecluster-bot-sealed.yml
   ```

3. Confirm the namespace terminates and does not hang.

## Recovering from a stuck deletion

Recreate the `Secret` in the affected namespace directly, without waiting for Flux.
The finalizers cannot drain until it exists, and Flux may itself be blocked behind `wait: true`.

`make apps/arc-runners/thecluster-bot-unseal` writes a live dump, so the stub carries an `ownerReference`
pointing at the `SealedSecret` it came from, along with a namespace and the usual server-set fields.
Applying it unedited into another namespace produces a `Secret` owned by a uid that does not exist there,
which the garbage collector deletes within seconds.
Strip that metadata:

```sh
yq 'del(.metadata.namespace, .metadata.ownerReferences, .metadata.creationTimestamp,
        .metadata.resourceVersion, .metadata.uid)' \
  hack/secrets/apps/arc-runners/thecluster-bot.yml |
  kubectl apply -n arc-<name> -f -
```

Delete the `Secret` once the namespace has drained, so it does not linger unmanaged by Flux.

The terminating objects then deregister and disappear, the reconcile slots free up, and the listeners settle.

## Hardening options

Not implemented, listed in rough order of cost:

- Raise `--runner-max-concurrent-reconciles` so one stuck namespace cannot occupy every slot.
  This widens the margin without removing the deadlock.
- Keep the `SealedSecret` documents for removed namespaces until the namespace is gone,
  accepting drift between the fanout file and the rendered namespace list.
- Give the `Secret` its own lifecycle rather than deriving it from the scale set list,
  so credentials outlive the scale set by construction.
