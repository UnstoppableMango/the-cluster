REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

CLUSTER ?= pinkdiamond
CMD     ?= preview
STACK   ?= ${CLUSTER}

GO         ?= go
CRD2PULUMI ?= $(GO) tool crd2pulumi
CURL       ?= curl
DEVCTL     ?= $(GO) tool devctl
DPRINT     ?= dprint
KUBECTL    ?= bin/kubectl
PULUMI     ?= bin/pulumi
YQ         ?= $(GO) tool yq

APPS  := $(wildcard apps/*)
INFRA := $(wildcard infra/*)

format fmt:
	$(DPRINT) fmt

.PHONY: ${APPS} ${INFRA}
${APPS} ${INFRA}: | bin/pulumi
	$(PULUMI) --cwd $@ ${CMD} --stack ${STACK}

bin/kubectl: .versions/kubernetes
	$(CURL) --fail -L -o $@ https://dl.k8s.io/release/v$(shell cat $<)/bin/${GOOS}/${GOARCH}/kubectl
	@chmod +x $@

bin/kubectl-slice: .versions/kubectl-slice
	$(DEVCTL) install $(@F) \
	https://github.com/patrickdappollonio/kubectl-slice/releases/download/v$(shell cat $<)/kubectl-slice_linux_x86_64.tar.gz

bin/pulumi: .versions/pulumi
	$(CURL) -fsSL https://get.pulumi.com | \
	sh -s -- --install-root ${CURDIR} --version $(shell cat $<) --no-edit-path
	@touch $@

bin/crds.yml: | bin/kubectl
	$(KUBECTL) get crds -oyaml | yq '.items[] | select(.metadata.name == "")'

infra/ceph/crds: infra/crds/manifests/ceph.rook.io.yaml
	$(CRD2PULUMI) $< --nodejsPath $@
infra/media/crds: $(addprefix infra/crds/manifests/,wireguards.vpn.wireguard-operator.io.yaml wireguardpeers.vpn.wireguard-operator.io.yaml)
	$(CRD2PULUMI) $< --nodejsPath $@
infra/crds/manifests/ceph.rook.io.yaml: .versions/rook | bin/kubectl
	$(CURL) --fail -L -o $@ https://raw.githubusercontent.com/rook/rook/v$(shell cat $<)/deploy/examples/crds.yaml
infra/crds/manifests/%.yaml: | bin/kubectl
	$(KUBECTL) get crd $* -oyaml > $@

.envrc: hack/example.envrc
	cp $< $@
