REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

GO         ?= go
DEVCTL     ?= $(GO) tool devctl
DOCKER     ?= docker
DPRINT     ?= dprint
FLUX       ?= flux
KUBECTL    ?= kubectl
KUBESEAL   ?= kubeseal
PULUMI     ?= pulumi
YQ         ?= yq

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

.PHONY: new-secret seal unseal secrets
new-secret seal unseal:
	@test -n "$(SECRET)" || { \
	echo 'usage: make $@ SECRET=<path> (e.g. SECRET=apps/dex/dex-credentials)' >&2; \
	exit 1; }
	@KUBECTL=$(KUBECTL) KUBESEAL=$(KUBESEAL) YQ=$(YQ) \
	hack/secrets.sh $(subst new-secret,new,$@) $(SECRET) $(SECRET_ARGS)

secrets:
	@KUBECTL=$(KUBECTL) KUBESEAL=$(KUBESEAL) YQ=$(YQ) hack/secrets.sh list

hack/sealed-secrets.pub:
	@KUBESEAL=$(KUBESEAL) hack/secrets.sh cert

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
