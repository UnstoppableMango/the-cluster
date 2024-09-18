_ := $(shell mkdir -p .make)
WORKING_DIR := $(shell pwd)
REPOSITORY  := github.com/unstoppablemango/the-cluster
DOMAIN      := thecluster.io

GOOS   := $(shell go env GOOS)
GOARCH := $(shell go env GOARCH)

STACK   := prod
CLUSTER := pinkdiamond

ROOT_MODULES := apps clusters dbs infra
MODULES := $(shell find ${ROOT_MODULES} -mindepth 1 -maxdepth 1 -type d)

GIT_LS_FILES ?= $(shell git ls-files --deduplicate)

SRC        := $(filter-out $(shell git ls-files -d),$(GIT_LS_FILES))
PROTO_SRC  := $(filter %.proto,${SRC})
TS_SRC     := $(filter %.ts,${SRC})
GO_GEN_SRC := $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)
GO_SRC     := $(filter %.go,${SRC}) $(GO_GEN_SRC)

COV_REPORT := cover.profile
TEST_REPORT := report.json
GINKGO_REPORTS := $(COV_REPORT) $(TEST_REPORT)

PULUMI := pulumi
GINKGO := go run github.com/onsi/ginkgo/v2/ginkgo
KUBEBUILDER := bin/kubebuilder --plugins thecluster.go.kubebuilder.io/v1-alpha

all: bin/thecluster bin/kubebuilder

tc: bin/thecluster $(TS_SRC)
	$< --interactive

kubebuilder: bin/kubebuilder
	$(KUBEBUILDER)

.PHONY: $(MODULES)
$(MODULES): bin/thecluster $(TS_SRC)
	$< --component $@

test: $(GINKGO_REPORTS)
testf: .make/clean_tests $(GINKGO_REPORTS)

gen: $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)

format: .make/go_fmt

tidy: go.mod go.sum ${GO_SRC}
	go mod tidy

bin/thecluster: go.mod go.sum $(GO_SRC)
	go build -o $@ ./cmd/thecluster/main.go

bin/kubebuilder: go.mod go.sum $(GO_SRC)
	go build -o $@ ./cmd/kubebuilder/main.go

gen/go/%.pb.go: buf.gen.yaml proto/%.proto
	buf generate

buf.lock: buf.yaml
	buf dep update
	buf dep prune

.envrc: hack/example.envrc
	cp $< $@

$(GINKGO_REPORTS) &:: go.mod go.sum $(GO_SRC)
	$(GINKGO) run --coverprofile=$(COV_REPORT) --race --trace --json-report=$(TEST_REPORT) -r ./...

.make/clean_tests:
	rm -f $(GINKGO_REPORTS)

.make/go_fmt: $(GO_SRC)
	go fmt ./...
	@touch $@
