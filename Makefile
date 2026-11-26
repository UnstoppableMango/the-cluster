REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

# nix/crds.nix uses the `|>` pipe operator, which is still experimental.
NIX_FLAGS ?= --extra-experimental-features pipe-operators

FLUX_SOURCE ?= flux-system
PKI_STACK   ?= UnstoppableMango/pki/prod

# The renovate chart names each CronJob after its release, one per GitHub account.
RENOVATE_RELEASE ?= unstoppablemango-renovate

reconcile:
	flux reconcile source git ${FLUX_SOURCE}

renovate:
	kubectl create job manual-$$(date +%s) --namespace renovate --from=cronjob/$(RENOVATE_RELEASE)

format fmt:
	nix $(NIX_FLAGS) fmt

check:
	nix $(NIX_FLAGS) flake check

update: flake.lock

.PHONY: hack/secrets/infrastructure/configs/cert-manager-system/ca.yml
hack/secrets/infrastructure/configs/cert-manager-system/ca.yml:
	@mkdir -p $(@D)
	PKI_STACK=$(PKI_STACK) hack/pki-ca-secret.sh $@

# One rule per top-level directory: make matches a slashless pattern against
# the file name alone, so a bare `%-sealed.yml` looks for the stub in the wrong
# directory.
define seal
kubeseal --format=yaml --cert=$| \
--secret-file $< --sealed-secret-file $@
endef

# $* drops the top-level directory, so derive the stub from the sealed file.
STUB = hack/secrets/$(patsubst %-sealed.yml,%.yml,$<)

# A fanned-out sealed file holds one copy of the secret per namespace.
define unseal
@mkdir -p $(dir $(STUB))
@umask 0177; \
kubectl get secret \
"$$(yq -r '.spec.template.metadata.name // .metadata.name' $< | head -1)" \
-n "$$(yq -r '.spec.template.metadata.namespace // .metadata.namespace' $< | head -1)" \
-o yaml > $(STUB); chmod 0600 $(STUB)
endef

# Otherwise make deletes a sealed file built on the way to -unseal.
.PRECIOUS: apps/%-sealed.yml infrastructure/%-sealed.yml

# Overrides the pattern rule: the runner credentials are fanned out to every
# scale set namespace.
ARC_RUNNER_CHART := charts/arc-runner-scale-set

# Only the inputs that determine the Namespace list, since resealing rewrites
# every document. Templates are named so a new one is a deliberate choice.
apps/arc-runners/thecluster-bot-sealed.yml: hack/secrets/apps/arc-runners/thecluster-bot.yml \
		apps/arc-runners/helm-release.yml \
		$(ARC_RUNNER_CHART)/templates/helmreleases.yaml \
		$(ARC_RUNNER_CHART)/templates/_helpers.tpl \
		| hack/sealed-secrets.pub
	SEALED_SECRETS_CERT=$| \
	hack/arc-fanout-secret.sh $< $(ARC_RUNNER_CHART) apps/arc-runners/helm-release.yml $@

apps/%-sealed.yml: hack/secrets/apps/%.yml | hack/sealed-secrets.pub
	$(seal)

infrastructure/%-sealed.yml: hack/secrets/infrastructure/%.yml | hack/sealed-secrets.pub
	$(seal)

apps/%-unseal: apps/%-sealed.yml
	$(unseal)

infrastructure/%-unseal: infrastructure/%-sealed.yml
	$(unseal)

hack/sealed-secrets.pub:
	kubeseal --fetch-cert \
	--controller-name sealed-secrets-controller \
	--controller-namespace flux-system \
	> $@

infrastructure/controllers/cert-manager-system/crds/crds.yaml: flake.lock nix/cert-manager-crds.nix
	cp $$(nix $(NIX_FLAGS) build .#cert-manager-crds --print-out-paths --no-link) $@

.PHONY: flake.lock
flake.lock: flake.nix
	nix $(NIX_FLAGS) flake update

.envrc: hack/example.envrc
	cp $< $@
