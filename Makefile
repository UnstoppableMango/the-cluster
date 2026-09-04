REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

GO         ?= go
DEVCTL     ?= $(GO) tool devctl
DOCKER     ?= docker
DPRINT     ?= dprint
FLUX       ?= flux
KUBECTL    ?= kubectl
KUBESEAL   ?= $(GO) tool kubeseal
PULUMI     ?= pulumi
YQ         ?= $(GO) tool yq

FLUX_SOURCE ?= flux-system
PKI_STACK   ?= UnstoppableMango/pki/prod

reconcile:
	$(FLUX) reconcile source git ${FLUX_SOURCE}

renovate:
	$(KUBECTL) create job manual-$$(date +%s) --namespace renovate --from=cronjob/renovate

format fmt:
	nix fmt

check:
	nix flake check

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

# Without this a sealed secret built on the way to a -unseal target counts as an
# intermediate file, and make deletes it afterwards.
.PRECIOUS: apps/%-sealed.yml infrastructure/%-sealed.yml

apps/%-sealed.yml: hack/secrets/apps/%.yml | hack/sealed-secrets.pub
	$(seal)

infrastructure/%-sealed.yml: hack/secrets/infrastructure/%.yml | hack/sealed-secrets.pub
	$(seal)

# The bare pattern is right here: the prerequisite carries no directory of its
# own, so make matches the whole target and $* is the full path.
%-unseal: %-sealed.yml
	@mkdir -p hack/secrets/$$(dirname $*)
	@umask 0177; \
	$(KUBECTL) get secret \
	"$$($(YQ) -r '.spec.template.metadata.name // .metadata.name' $<)" \
	-n "$$($(YQ) -r '.spec.template.metadata.namespace // .metadata.namespace' $<)" \
	-o yaml > hack/secrets/$*.yml; chmod 0600 hack/secrets/$*.yml

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
