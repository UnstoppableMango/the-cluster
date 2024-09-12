_ := $(shell mkdir -p .make)
WORKING_DIRECTORY := $(shell pwd)

STACK   := prod
CLUSTER := pinkdiamond

ROOT_MODULES := apps clusters dbs infra
MODULES := $(shell find ${ROOT_MODULES} -mindepth 1 -maxdepth 1 -type d)

SRC        := $(shell git ls-files)
PROTO_SRC  := $(filter %.proto,${SRC})
TS_SRC     := $(filter %.ts,${SRC})
GO_GEN_SRC := $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)
GO_SRC     := $(filter %.go,${SRC}) $(GO_GEN_SRC)

PULUMI := pulumi

tc: bin/thecluster $(TS_SRC)
	$<

gen: $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)

tidy: go.mod go.sum ${GO_SRC}
	go mod tidy

bin/thecluster: $(filter cmd/%,${GO_SRC})
	go build -o $@ ./cmd/thecluster/main.go

gen/go/%.pb.go: proto/%.proto
	buf generate $?
