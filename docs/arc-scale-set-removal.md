# Removing an ARC runner scale set

Removing an entry from `.spec.values.scaleSets` in `apps/arc-runners/helm-release.yml` can deadlock the
`AutoscalingRunnerSet` finalizer and leave the namespace `Terminating` forever.
Follow the drain procedure below rather than deleting the entry and pushing.

The worked example throughout is the `thecluster.lan` entry.
Three names come out of it and none of them match:

| Object                 | Name                 | Namespace            | Source                                                      |
| ---------------------- | -------------------- | -------------------- | ----------------------------------------------------------- |
| Child `HelmRelease`    | `thecluster.lan`     | `arc-runners`        | `helmReleaseName`, defaulting to the entry's `name`         |
| `Namespace`            | `arc-thecluster-lan` | n/a                  | `arc-runner-scale-set.namespace`, `.` and `_` folded to `-` |
| `AutoscalingRunnerSet` | `thecluster`         | `arc-thecluster-lan` | `runnerScaleSetName`, shared by every scale set             |

## The finalizer dependency

Every `AutoscalingRunnerSet` carries `autoscalingrunnerset.actions.github.com/finalizer`.
Before the object can be removed, the finalizer resolves the GitHub App credentials named by
`githubConfigSecret` and calls GitHub to deregister the scale set.
Resolution reads a `Secret` in the same namespace as the `AutoscalingRunnerSet`.

If that `Secret` is gone, the finalizer fails:

```text
failed to resolve app config: failed to get kubernetes secret: "<namespace>/thecluster-bot"
```

A failed finalizer requeues, and the object retries forever.

## Why the retry is not harmless

The retry itself is rate limited, so it is not a busy loop and it does not starve other scale sets.
Each modern controller runs with its own worker count, and only `EphemeralRunner` reads
`--runner-max-concurrent-reconciles`; `AutoscalingRunnerSet` and `AutoscalingListener` get one worker each.
What breaks is downstream of the retry:

- The `AutoscalingRunnerSet` never loses its finalizer, so the object stays.
- Its `Namespace` cannot finalize while the object is there, so the namespace sits in `Terminating`.
- Flux stalls behind that namespace, so unrelated changes in `apps/arc-runners` stop applying.
- The scale set stays registered with GitHub, and its name is still claimed.

Only the log line above identifies the namespace actually at fault.

Do not attribute cluster-wide listener churn to this.
Every listener pod being under a minute old across every scale set is the leader-election symptom
fixed in #4212, and it has a different cause and a different fix.

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
Deleting an `AutoscalingRunnerSet` is not a graceful drain and will interrupt running jobs,
so stop job acquisition and wait for the queue to empty first.

1. Suspend the parent so Flux does not re-render the child mid-procedure:

   ```sh
   flux suspend helmrelease unstoppablemango-runners -n arc-runners
   ```

2. Stop the scale set acquiring work, and wait for in-flight jobs to finish:

   ```sh
   kubectl patch helmrelease thecluster.lan -n arc-runners --type=merge \
     -p '{"spec":{"values":{"minRunners":0,"maxRunners":0}}}'
   flux reconcile helmrelease thecluster.lan -n arc-runners
   kubectl get ephemeralrunners -n arc-thecluster-lan -w
   ```

   Wait until no `EphemeralRunner` objects remain.

3. Delete the child `HelmRelease` and wait for the `AutoscalingRunnerSet` to disappear:

   ```sh
   kubectl delete helmrelease thecluster.lan -n arc-runners
   kubectl wait --for=delete autoscalingrunnerset/thecluster -n arc-thecluster-lan --timeout=5m
   ```

   The parent is suspended, so nothing recreates the child while this runs.

4. Remove the entry from `.spec.values.scaleSets`, regenerate the fanout file, and push:

   ```sh
   make apps/arc-runners/thecluster-bot-sealed.yml
   ```

5. Confirm the namespace terminates, then resume the parent:

   ```sh
   kubectl get namespace arc-thecluster-lan
   flux resume helmrelease unstoppablemango-runners -n arc-runners
   ```

## Recovering from a stuck deletion

Check the namespace phase first, because the two cases have different exits:

```sh
kubectl get namespace arc-thecluster-lan -o jsonpath='{.status.phase}{"\n"}'
```

### The namespace is still `Active`

Recreate the `Secret` directly, without waiting for Flux.
The finalizer cannot drain until it exists, and Flux may itself be blocked behind `wait: true`.

Copy it from any namespace that still has it.
The fanout writes the same credentials into every scale-set namespace, so a healthy sibling is as good
as the sealed source, and nothing is written to disk in plaintext:

```sh
kubectl get secret thecluster-bot -n arc-the-cluster -o yaml |
  yq 'del(.metadata.namespace, .metadata.ownerReferences, .metadata.creationTimestamp,
          .metadata.resourceVersion, .metadata.uid)' |
  kubectl apply -n arc-thecluster-lan -f -
```

The `ownerReference` points at the `SealedSecret` the sibling came from.
Applied unedited into another namespace it names a uid that does not exist there,
and the garbage collector deletes the `Secret` within seconds, which is why it is stripped.

The terminating objects then deregister and disappear, and the namespace finalizes.
Delete the `Secret` afterwards if the namespace survives, so it does not linger unmanaged by Flux.

If no sibling namespace has the `Secret`, unseal it instead, and remove the plaintext dump when done:

```sh
make apps/arc-runners/thecluster-bot-unseal
yq 'del(.metadata.namespace, .metadata.ownerReferences, .metadata.creationTimestamp,
        .metadata.resourceVersion, .metadata.uid)' \
  hack/secrets/apps/arc-runners/thecluster-bot.yml |
  kubectl apply -n arc-thecluster-lan -f -
shred -u hack/secrets/apps/arc-runners/thecluster-bot.yml
```

### The namespace is `Terminating`

Recreating the `Secret` is not an option: the API server rejects creating any object in a terminating
namespace, so the finalizer can never succeed and the deadlock has to be broken by hand.

1. Drop the finalizer so the object can be collected:

   ```sh
   kubectl patch autoscalingrunnerset thecluster -n arc-thecluster-lan \
     --type=merge -p '{"metadata":{"finalizers":[]}}'
   ```

   Repeat for any `AutoscalingListener`, `EphemeralRunnerSet`, or `EphemeralRunner` left holding one:

   ```sh
   kubectl get autoscalinglisteners,ephemeralrunnersets,ephemeralrunners -n arc-thecluster-lan
   ```

   Older ARC versions also put `actions.github.com/cleanup-protection` on the namespace's
   `Role`, `RoleBinding`, `ServiceAccount`, and `Secret`.
   0.14.2 only removes that finalizer and never adds it, so it should not appear on anything new.

2. Confirm the namespace finalizes:

   ```sh
   kubectl get namespace arc-thecluster-lan
   ```

3. Deregister the scale set in GitHub, which step 1 skipped.
   The listener also holds a registration that no longer has a Kubernetes object behind it.
   Under the repository or organization the entry's `githubConfigUrl` points at, open
   Settings, Actions, Runners, and remove the `thecluster` runner scale set.

Reusing the same scale-set name before deregistering it produces a duplicate registration in GitHub.

## Hardening options

Not implemented, listed in rough order of cost:

- Keep the `SealedSecret` documents for removed namespaces until the namespace is gone,
  accepting drift between the fanout file and the rendered namespace list.
- Wrap the drain above in a Makefile target, so the ordering is not a thing to remember.
- Give the `Secret` its own lifecycle rather than deriving it from the scale set list,
  so credentials outlive the scale set by construction.
