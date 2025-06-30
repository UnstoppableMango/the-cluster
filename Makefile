REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

STACK   := prod
CLUSTER := pinkdiamond
CMD     ?= preview

GO         ?= go
CRD2PULUMI ?= $(GO) tool crd2pulumi
CURL       ?= curl
DEVCTL     ?= $(GO) tool devctl
KUBECTL    ?= bin/kubectl
PULUMI     ?= bin/pulumi

APPS  := $(wildcard apps/*)
INFRA := $(wildcard infra/*)

.PHONY: ${APPS} ${INFRA}
${APPS} ${INFRA}: | bin/pulumi
	$(PULUMI) -C $@ ${CMD}

bin/kubectl: .versions/kubernetes
	$(CURL) --fail -L -o $@ https://dl.k8s.io/release/v$(shell cat $<)/bin/${GOOS}/${GOARCH}/kubectl
	chmod +x $@

bin/pulumi: .versions/pulumi
	$(CURL) -fsSL https://get.pulumi.com | \
	sh -s -- --install-root ${CURDIR} --version $(shell cat $<) --no-edit-path

infra/ceph/crds: infra/crds/manifests/ceph.rook.io.yaml | bin/crd2pulumi
	$(CRD2PULUMI) $< --nodejsPath $@
infra/media/crds: $(addprefix infra/crds/manifests/,wireguards.vpn.wireguard-operator.io.yaml wireguardpeers.vpn.wireguard-operator.io.yaml)
	$(CRD2PULUMI) $< --nodejsPath $@
infra/crds/manifests/ceph.rook.io.yaml: .versions/rook | bin/kubectl
	$(CURL) --fail -L -o $@ https://raw.githubusercontent.com/rook/rook/v$(shell cat $<)/deploy/examples/crds.yaml
infra/crds/manifests/%.yaml: | bin/kubectl
	$(KUBECTL) get crd $* -oyaml > $@

.envrc: hack/example.envrc
	cp $< $@
