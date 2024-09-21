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
GO_SRC     := $(filter %.go,${SRC}) $(GO_GEN_SRC)

COV_REPORT     := cover.profile
TEST_REPORT    := report.json
GINKGO_REPORTS := $(COV_REPORT) $(TEST_REPORT)
TEST_SUITES    := $(filter %_suite_test.go,${GO_SRC})
TEST_PACKAGES  := $(dir ${TEST_SUITES})
TEST_SENTINELS := $(addsuffix .test,$(TEST_PACKAGES))

PULUMI         := pulumi
GINKGO         := go run github.com/onsi/ginkgo/v2/ginkgo
KUBEBUILDER    := bin/kubebuilder --plugins thecluster.go.kubebuilder.io/v1-alpha
KUBECTL        := bin/kubectl
KUSTOMIZE      := bin/kustomize
CONTROLLER_GEN := bin/controller-gen
ENVTEST        := bin/setup-envtest

all: bin/thecluster bin/kubebuilder

tc: bin/thecluster $(TS_SRC)
	$< --interactive

.PHONY: $(MODULES)
$(MODULES): bin/thecluster $(TS_SRC)
	$< --component $@

test: $(TEST_SENTINELS)
testf: $(TEST_SENTINELS)

gen: $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)

format: .make/go_fmt

tidy: go.mod go.sum ${GO_SRC}
	go mod tidy

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

gen/go/%.pb.go: buf.gen.yaml proto/%.proto
	buf generate

buf.lock: buf.yaml
	buf dep update
	buf dep prune

.envrc: hack/example.envrc
	cp $< $@

.make/clean_ginkgo_reports:
	rm -f $(GINKGO_REPORTS)

.make/go_fmt: $(GO_SRC)
	go fmt ./...
	@touch $@

ifeq ($(CI),)
TEST_FLAGS := -v
else
TEST_FLAGS := --github-output --race --trace --coverprofile=${COV_REPORT}
endif

# $(GINKGO_REPORTS) &:: go.mod go.sum $(GO_SRC) bin/kubectl bin/kubebuilder
# 	$(GINKGO) run --silence-skips ${TEST_FLAGS} -r ./...

$(TEST_SENTINELS) &:
	@echo $@
	# $(GINKGO) run --silence-skips ${TEST_FLAGS} $(dir $@)

temp: ${TEST_SENTINELS}
	@echo $?
