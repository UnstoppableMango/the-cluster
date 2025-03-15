_ := $(shell mkdir -p .make bin)
WORKING_DIR := $(shell pwd)
REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io
LOCALBIN    := ${WORKING_DIR}/bin

STACK   := prod
CLUSTER := pinkdiamond

ROOT_MODULES := apps clusters dbs infra
MODULES      := $(shell find ${ROOT_MODULES} -mindepth 1 -maxdepth 1 -type d)

GIT_LS_FILES ?= $(shell git ls-files --deduplicate)

SRC    := $(filter-out $(shell git ls-files -d),$(GIT_LS_FILES))
TS_SRC := $(filter %.ts,${SRC})

CONTAINERS  := $(wildcard containers/*)

PULUMI    := ${LOCALBIN}/pulumi
KUBECTL   := ${LOCALBIN}/kubectl
KUSTOMIZE := ${LOCALBIN}/kustomize

ensure: $(addprefix bin/,kubebuilder kubectl kustomize pulumi)

clean:
	rm -rf bin

.PHONY: docker
docker: .make/operator_docker-build

bin/kubectl: .versions/kubernetes
	curl --fail -L -o $@ https://dl.k8s.io/release/v$(shell cat $<)/bin/${GOOS}/${GOARCH}/kubectl
	chmod +x $@

KUSTOMIZE_INSTALL_SCRIPT ?= "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"
bin/kustomize: .versions/kustomize
	curl --fail -Ss ${KUSTOMIZE_INSTALL_SCRIPT} | bash -s -- $(shell cat $<) ${LOCALBIN}

bin/pulumi: .versions/pulumi
	curl -fsSL https://get.pulumi.com | sh -s -- --install-root ${WORKING_DIR} --version $(shell cat $<) --no-edit-path

bin/crd2pulumi: .versions/crd2pulumi
	GOBIN=${LOCALBIN} go install github.com/pulumi/crd2pulumi@v$(shell cat $<)

bin/ux: .versions/ux
	curl -sSL https://github.com/UnstoppableMango/tdl/releases/download/v$(shell cat $<)/tdl-$(shell go env GOOS)-$(shell go env GOARCH).tar.gz | tar -zvx -C bin ux
	@touch $@

infra/ceph/crds: infra/crds/manifests/ceph.rook.io.yaml | bin/crd2pulumi
	bin/crd2pulumi $< --nodejsPath $@

infra/media/crds: $(addprefix infra/crds/manifests/,wireguards.vpn.wireguard-operator.io.yaml wireguardpeers.vpn.wireguard-operator.io.yaml)
	ux tool crd2pulumi $? --output $@ -- --nodejs

infra/crds/manifests/ceph.rook.io.yaml: .versions/rook | bin/kubectl
	curl --fail -L -o $@ https://raw.githubusercontent.com/rook/rook/v$(shell cat $<)/deploy/examples/crds.yaml

infra/crds/manifests/%.yaml: | bin/kubectl
	bin/kubectl get crd $* -oyaml > $@

.envrc: hack/example.envrc
	cp $< $@

.PHONY: containers/workspace
containers/workspace:
	yarn install --cwd $@ && $(PULUMI) -C $@ -s local preview

.PHONY: .kube/config
.kube/config: | bin/thecluster
	$(THECLUSTER) test-cluster ensure $@
