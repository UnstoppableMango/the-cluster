# Migration backlog

`pinkdiamond-wiring.yaml` is the set of Flux Kustomizations that ran on pinkdiamond.
It is a backlog, not an archive: each document is a component whose manifests are still in this repo but which no cluster currently reconciles.

Nothing applies this file.
Every Kustomization in the repo names an explicit `spec.path` and none of them glob, so a file under `docs/` is unreachable by any controller.

## Porting a component

1. Find its document: `grep -A20 'name: infra-monitoring' pinkdiamond-wiring.yaml`
2. Check what it depends on. The `dependsOn` edges are the ordering constraints that were learned the hard way; keep them unless the reason is gone.
3. Copy the document into `clusters/rosequartz/infrastructure.yaml` (or `apps.yaml`), adjusting paths if the component needs a cluster-scoped overlay.
4. Delete the document from this file.

The file disappearing is the migration's done-signal.

## What to check when porting

Kustomization names are cluster-scoped in practice, so the same name may already exist in `clusters/rosequartz/` pointing at a different path.
Compare before copying.

A component that reaches into `infrastructure/controllers/flux-system` needs care: that directory pulls in `../external-snapshotter` and `../gateway-api`, which rosequartz already applies as Kustomizations of their own.
Applying both would put those objects in two prune inventories.
Split the shared paths out before porting `infra-flux`.

Sealed secrets are encrypted against the sealed-secrets controller's key.
rosequartz already decrypts several secrets committed for pinkdiamond, so the key is shared, but confirm the Secret materializes rather than assuming it.

## Known gaps

`infrastructure/configs/rook-ceph/reclaim/` is listed in that directory's `kustomization.yaml` but rosequartz targets only the `cluster`, `storage`, `snapshots`, and `dashboard` subdirectories, so `reclaim` is unreached.
Decide whether it should come along when the ceph configs are next revisited.
