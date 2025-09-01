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
CURL       ?= curl
DEVCTL     ?= $(GO) tool devctl
DPRINT     ?= dprint
FLUX       ?= flux
KUBECTL    ?= bin/kubectl
KUBESEAL   ?= $(GO) tool kubeseal
NPM        ?= npm
PULUMI     ?= bin/pulumi
YQ         ?= $(GO) tool yq

GOOS   != $(GO) env GOOS
GOARCH != $(GO) env GOARCH

APPS       := $(wildcard apps/*)
INFRA      := $(wildcard infra/*)
COMPONENTS := $(addprefix components/,cloudflare-ingress oauth oauth2-proxy postgres-db)

FLUX_SOURCE ?= flux-system

reconcile:
	$(FLUX) reconcile source git ${FLUX_SOURCE}

format fmt:
	$(DPRINT) fmt

.PHONY: ${APPS} ${INFRA}
${APPS} ${INFRA}: | bin/pulumi
	$(PULUMI) --cwd $@ ${CMD} ${PULUMI_ARGS}

.PHONY: components ${COMPONENTS}
components ${COMPONENTS}:
	cd $@ && $(NPM) install

flux/%-sealed.yml: hack/secrets/%.yml | sealed-secrets.pub
	$(KUBESEAL) --format=yaml --cert=$| < $< > $@

sealed-secrets.pub:
	$(KUBESEAL) --fetch-cert \
	--controller-name sealed-secrets-controller \
	--controller-namespace flux-system \
	> $@

bin/kubectl: .versions/kubernetes
	$(CURL) --fail -L -o $@ https://dl.k8s.io/release/v$(shell cat $<)/bin/${GOOS}/${GOARCH}/kubectl
	@chmod +x $@

bin/pulumi: .versions/pulumi
	$(CURL) -fsSL https://get.pulumi.com | \
	sh -s -- --install-root ${CURDIR} --version $(shell cat $<) --no-edit-path
	@touch $@

bin/crds.yml: hack/crd-filter.yq | bin/kubectl
	$(KUBECTL) get crds -oyaml | $(YQ) --from-file $< >$@
crds/package.json: bin/crds.yml
	rm -rf crds && $(CRD2PULUMI) --nodejsPath crds $<

.envrc: hack/example.envrc
	cp $< $@
