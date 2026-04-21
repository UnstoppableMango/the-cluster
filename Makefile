REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

CLUSTER ?= pinkdiamond
CMD     ?= up
STACK   ?= ${CLUSTER}

# If ${CMD} is `up` or `preview`
ifneq ($(findstring ${CMD},up preview),)
PULUMI_ARGS += --stack ${STACK}
endif

GO         ?= go
CRD2PULUMI ?= $(GO) tool crd2pulumi
DEVCTL     ?= $(GO) tool devctl
DOCKER     ?= docker
DPRINT     ?= dprint
FLUX       ?= flux
KUBECTL    ?= kubectl
KUBESEAL   ?= $(GO) tool kubeseal
PULUMI     ?= pulumi
YARN       ?= yarn
YQ         ?= $(GO) tool yq

APPS       := $(wildcard apps/*)
INFRA      := $(wildcard infra/*)
COMPONENTS := $(addprefix components/,oauth2-proxy)

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

.PHONY: ${APPS} ${INFRA}
${APPS} ${INFRA}:
	$(PULUMI) --cwd $@ ${CMD} ${PULUMI_ARGS}

.PHONY: components ${COMPONENTS}
components ${COMPONENTS}:
	cd $@ && $(YARN) install

runner: containers/runner/Dockerfile
	$(DOCKER) buildx build -f $< .

.PHONY: hack/secrets/infrastructure/configs/cert-manager/ca.yml
hack/secrets/infrastructure/configs/cert-manager/ca.yml: | bin/pulumi
	@mkdir -p $(@D)
	PULUMI=$(PULUMI) PKI_STACK=$(PKI_STACK) YQ=$(YQ) hack/pki-ca-secret.sh $@

flux/%-sealed.yml: hack/secrets/%.yml | hack/sealed-secrets.pub
	$(KUBESEAL) --format=yaml --cert=$| \
	--secret-file $< --sealed-secret-file $@

hack/sealed-secrets.pub:
	$(KUBESEAL) --fetch-cert \
	--controller-name sealed-secrets-controller \
	--controller-namespace flux-system \
	> $@

bin/image.tar: containers/default.nix containers/runner/default.nix
	nix build '.#runner' --out-link $@
	$(DOCKER) load < $@

flux/infrastructure/controllers/cert-manager/crds/crds.yaml: flake.lock nix/cert-manager-crds.nix
	cp $$(nix build .#cert-manager-crds --print-out-paths --no-link) $@

bin/crds.yml: hack/crd-filter.yq
	$(KUBECTL) get crds -oyaml | $(YQ) --from-file $< >$@
crds/package.json: bin/crds.yml
	rm -rf crds && $(CRD2PULUMI) --nodejsPath crds $<

.PHONY: flake.lock
flake.lock: flake.nix
	nix flake update

yarn.lock: package.json
	$(YARN) install

.envrc: hack/example.envrc
	cp $< $@
