REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

GO         ?= go
DEVCTL     ?= $(GO) tool devctl
DOCKER     ?= docker
DPRINT     ?= dprint
FLUX       ?= flux
HELM       ?= helm
KUBECTL    ?= kubectl
KUBESEAL   ?= $(GO) tool kubeseal
NIX        ?= nix
PULUMI     ?= pulumi
YQ         ?= $(GO) tool yq

# nix/crds.nix uses the `|>` pipe operator, which is still experimental.
NIX_FLAGS ?= --extra-experimental-features pipe-operators

FLUX_SOURCE ?= flux-system
PKI_STACK   ?= UnstoppableMango/pki/prod

# The renovate chart names each CronJob after its release, one per GitHub account.
RENOVATE_RELEASE ?= unstoppablemango-renovate

reconcile:
	$(FLUX) reconcile source git ${FLUX_SOURCE}

renovate:
	$(KUBECTL) create job manual-$$(date +%s) --namespace renovate --from=cronjob/$(RENOVATE_RELEASE)

format fmt:
	$(NIX) $(NIX_FLAGS) fmt

check:
	$(NIX) $(NIX_FLAGS) flake check

update: flake.lock

runner: containers/runner/Dockerfile
	$(DOCKER) buildx build -f $< .

.PHONY: hack/secrets/infrastructure/configs/cert-manager-system/ca.yml
hack/secrets/infrastructure/configs/cert-manager-system/ca.yml: | bin/pulumi
	@mkdir -p $(@D)
	PULUMI=$(PULUMI) PKI_STACK=$(PKI_STACK) YQ=$(YQ) hack/pki-ca-secret.sh $@

.PHONY: hack/secrets/infrastructure/configs/velero-system/ceph-credentials.yml
hack/secrets/infrastructure/configs/velero-system/ceph-credentials.yml:
	@mkdir -p $(@D)
	KUBECTL=$(KUBECTL) YQ=$(YQ) hack/velero-ceph-credentials.sh $@

# One rule per top-level manifest directory rather than a bare `%-sealed.yml`.
# GNU make matches a target pattern containing no slash against the file name
# alone and prepends the target's own directory to the prerequisites, so a bare
# pattern looks for infrastructure/<ns>/hack/secrets/secret.yml and never fires.
# A slash in the pattern makes it match the whole path, which is what the
# `flux/%-sealed.yml` shape used to get for free.
define seal
$(KUBESEAL) --format=yaml --cert=$| \
--secret-file $< --sealed-secret-file $@
endef

# $* drops the top-level directory, which differs per rule, so the stub path is
# derived from the sealed file instead: hack/secrets/ mirrors the manifest tree.
STUB = hack/secrets/$(patsubst %-sealed.yml,%.yml,$<)

# head -1 because a sealed file may hold one document per namespace, as
# apps/arc-runners/thecluster-bot-sealed.yml does. They all carry the same
# secret, so the first one is as good as any.
define unseal
@mkdir -p $(dir $(STUB))
@umask 0177; \
$(KUBECTL) get secret \
"$$($(YQ) -r '.spec.template.metadata.name // .metadata.name' $< | head -1)" \
-n "$$($(YQ) -r '.spec.template.metadata.namespace // .metadata.namespace' $< | head -1)" \
-o yaml > $(STUB); chmod 0600 $(STUB)
endef

# Without this a sealed secret built on the way to a -unseal target counts as an
# intermediate file, and make deletes it afterwards.
.PRECIOUS: apps/%-sealed.yml infrastructure/%-sealed.yml

# Overrides the pattern rule below: one scale set per namespace means the runner
# credentials have to land in every one of them, so this secret is fanned out
# rather than sealed once. More specific rules win in make, so listing it here is
# enough to take over.
ARC_RUNNER_CHART := charts/arc-runner-scale-set

apps/arc-runners/thecluster-bot-sealed.yml: hack/secrets/apps/arc-runners/thecluster-bot.yml \
		apps/arc-runners/helm-release.yml \
		$(wildcard $(ARC_RUNNER_CHART)/templates/*) $(ARC_RUNNER_CHART)/values.yaml \
		| hack/sealed-secrets.pub
	HELM=$(HELM) KUBESEAL=$(KUBESEAL) YQ=$(YQ) SEALED_SECRETS_CERT=$| \
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
	$(KUBESEAL) --fetch-cert \
	--controller-name sealed-secrets-controller \
	--controller-namespace flux-system \
	> $@

bin/image.tar: containers/default.nix containers/runner/default.nix
	nix build '.#runner' --out-link $@
	$(DOCKER) load < $@

infrastructure/controllers/cert-manager-system/crds/crds.yaml: flake.lock nix/cert-manager-crds.nix
	cp $$(nix build .#cert-manager-crds --print-out-paths --no-link) $@

.PHONY: flake.lock
flake.lock: flake.nix
	nix flake update

.envrc: hack/example.envrc
	cp $< $@
