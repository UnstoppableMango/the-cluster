_ := $(shell mkdir -p .make bin)
WORKING_DIR := $(shell pwd)
REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io
LOCALBIN    := ${WORKING_DIR}/bin

GOOS   := $(shell go env GOOS)
GOARCH := $(shell go env GOARCH)
GOBIN  := ${LOCALBIN}

STACK   := prod
CLUSTER := pinkdiamond

ROOT_MODULES := apps clusters dbs infra
MODULES      := $(shell find ${ROOT_MODULES} -mindepth 1 -maxdepth 1 -type d)

GIT_LS_FILES ?= $(shell git ls-files --deduplicate)

SRC        := $(filter-out $(shell git ls-files -d),$(GIT_LS_FILES))
PROTO_SRC  := $(filter %.proto,${SRC})
TS_SRC     := $(filter %.ts,${SRC})
GO_GEN_SRC := $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)
GO_SRC     := $(sort $(filter %.go,${SRC}) $(GO_GEN_SRC))

GO_PACKAGES := $(sort $(dir ${GO_SRC}))

CONTAINERS := $(wildcard containers/*)

COV_REPORT     := cover.profile
TEST_REPORT    := report.json
TEST_SUITES    := $(filter %_suite_test.go,$(filter-out operator/%,${GO_SRC}))
TEST_PACKAGES  := $(dir ${TEST_SUITES})
TEST_SENTINELS := $(addsuffix ${TEST_REPORT},${TEST_PACKAGES})
GINKGO_REPORTS := $(COV_REPORT) $(TEST_SENTINELS)

PULUMI         := bin/pulumi
GINKGO         := bin/ginkgo
KUBEBUILDER    := bin/kubebuilder --plugins thecluster.go.kubebuilder.io/v1-alpha
KUBECTL        := bin/kubectl
KUSTOMIZE      := bin/kustomize
CONTROLLER_GEN := bin/controller-gen
ENVTEST        := bin/setup-envtest

all: bin/thecluster bin/kubebuilder

tc: bin/thecluster $(TS_SRC)
	$< --interactive

.PHONY: operator
operator:
	$(MAKE) -C operator --no-print-directory

.PHONY: $(MODULES)
$(MODULES): bin/thecluster $(TS_SRC)
	$< --component $@

test: $(TEST_SENTINELS)
testf: .make/clean_tests $(TEST_SENTINELS)

e2e: .make/operator_e2e

gen: $(GO_GEN_SRC) .make/controller_gen_manifests .make/controller_gen_object .make/operator_manifests

format: .make/go_fmt

lint: .make/operator_lint

tidy: go.mod go.sum ${GO_SRC}
	go mod tidy

ensure: $(addprefix bin/,kubebuilder kubectl kustomize controller-gen setup-envtest ginkgo pulumi)

clean:
	rm -rf bin

bin/thecluster: go.mod go.sum $(GO_SRC)
	go build -o $@ ./cmd/thecluster/main.go

kubebuilder: bin/kubebuilder
bin/kubebuilder: go.mod go.sum $(GO_SRC)
	go build -o $@ ./cmd/kubebuilder/main.go

bin/kubectl: .versions/kubernetes
	curl --fail -L -o $@ https://dl.k8s.io/release/v$(shell cat $<)/bin/${GOOS}/${GOARCH}/kubectl
	chmod +x $@

KUSTOMIZE_INSTALL_SCRIPT ?= "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"
kustomize: bin/kustomize
bin/kustomize: .versions/kustomize
	curl --fail -Ss ${KUSTOMIZE_INSTALL_SCRIPT} | bash -s -- $(shell cat $<) ${LOCALBIN}

controller-gen: bin/controller-gen
bin/controller-gen: .versions/controller-tools
	GOBIN=${LOCALBIN} go install sigs.k8s.io/controller-tools/cmd/controller-gen@v$(shell cat $<)

setup-envtest: bin/setup-envtest
bin/setup-envtest:
	GOBIN=${LOCALBIN} go install sigs.k8s.io/controller-runtime/tools/setup-envtest@latest

bin/ginkgo: go.mod go.sum
	GOBIN=${LOCALBIN} go install github.com/onsi/ginkgo/v2/ginkgo

bin/pulumi: .versions/pulumi
	curl -fsSL https://get.pulumi.com | sh -s -- --install-root ${WORKING_DIR} --version $(shell cat $<) --no-edit-path

.PHONY: $(CONTAINERS)
$(CONTAINERS): containers/%: containers/%/Dockerfile
	docker build ${WORKING_DIR} -f $<

gen/go/%.pb.go: buf.gen.yaml proto/%.proto
	buf generate

buf.lock: buf.yaml
	buf dep update
	buf dep prune

.envrc: hack/example.envrc
	cp $< $@

%_suite_test.go: | bin/ginkgo
	cd $(dir $*) && ${WORKING_DIR}/$(GINKGO) bootstrap

$(GO_SRC:%.go=%_test.go): %_test.go: | bin/ginkgo
	cd $(dir $@) && ${WORKING_DIR}/$(GINKGO) generate $(notdir $*)

.PHONY: .kube/config
.kube/config: | bin/thecluster
ifeq (,$(wildcard .kube/config))
	bin/thecluster test-cluster start $@
else
	bin/thecluster test-cluster stop $@ && rm $@
endif

.make/clean_ginkgo_reports:
	rm -f $(GINKGO_REPORTS)

.make/go_fmt: $(GO_SRC)
	go fmt ./...
	@touch $@

ifeq ($(CI),)
TEST_FLAGS := --json-report ${TEST_REPORT} --keep-separate-reports
else
TEST_FLAGS := --github-output --race --trace --coverprofile=${COV_REPORT}
endif

# Why do I insist on creating jank like this
cmd/kubebuilder/${TEST_REPORT}: | bin/kubebuilder bin/kubectl
$(TEST_SENTINELS) &: $(filter $(addsuffix %,${TEST_PACKAGES}),${GO_SRC}) | bin/ginkgo
	$(GINKGO) run --silence-skips ${TEST_FLAGS} $(sort $(dir $?))

.make/clean_tests:
	rm -f ${TEST_SENTINELS}

.make/go_e2e_tests:
	$(GINKGO) run --silence-skips ${TEST_FLAGS} -r ./... --label-filter E2E

comma:= ,
CGEN_PATHS := $(subst $(eval ) ,$(comma),${GO_PACKAGES})

.make/controller_gen_manifests: $(filter cmd/kubebuilder/%,${SRC}) | bin/controller-gen
	$(CONTROLLER_GEN) rbac:roleName=manager-role crd webhook paths="./cmd/kubebuilder/" output:crd:artifacts:config=config/crd/bases
	@touch $@
.make/controller_gen_object: $(filter cmd/kubebuilder/%,${SRC}) | bin/controller-gen
	$(CONTROLLER_GEN) object paths="./cmd/kubebuilder/"
	@touch $@

MOP := $(MAKE) -C operator --no-print-directory
.make/operator_e2e: $(filter operator/%,${SRC}) | bin/thecluster
	bin/thecluster test-cluster start .kube/config
	-$(MOP) test
	bin/thecluster test-cluster stop .kube/config
	@touch $@
.make/operator_manifests: $(filter operator/%,${SRC})
	$(MOP) manifests
	@touch $@
.make/operator_lint: $(filter operator/%,${SRC})
	$(MOP) lint
	@touch $@
.make/operator_lint-fix: $(filter operator/%,${SRC})
	$(MOP) lint-fix
	@touch $@
.make/operator_install:
	$(MOP) install
.make/operator_uninstall:
	$(MOP) uninstall
.make/operator_deploy:
	$(MOP) deploy
.make/operator_undeploy:
	$(MOP) undeploy
.make/operator_run:
	$(MOP) run
.make/operator_docker-build:
	$(MOP) docker-build
