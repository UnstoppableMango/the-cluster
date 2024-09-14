_ := $(shell mkdir -p .make)
WORKING_DIR := $(shell pwd)

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

tc: bin/thecluster $(TS_SRC)
	$<

test: $(GINKGO_REPORTS)
testf: .make/clean_tests $(GINKGO_REPORTS)

gen: $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)

tidy: go.mod go.sum ${GO_SRC}
	go mod tidy

bin/thecluster: go.mod go.sum $(GO_SRC)
	go build -o $@ ./cmd/thecluster/main.go

gen/go/%.pb.go: buf.gen.yaml proto/%.proto
	buf generate

buf.lock: buf.yaml
	buf dep update
	buf dep prune

$(GINKGO_REPORTS) &:: go.mod go.sum $(GO_SRC)
	$(GINKGO) run --coverprofile=$(COV_REPORT) \
	--race --trace --json-report=$(TEST_REPORT) -r ./...

.make/clean_tests:
	rm -f $(GINKGO_REPORTS)
