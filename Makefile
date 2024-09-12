_ := $(shell mkdir -p .make)
WORKING_DIRECTORY := $(shell pwd)

STACK   := prod
CLUSTER := pinkdiamond

ROOT_MODULES := apps clusters dbs infra
MODULES := $(shell find ${ROOT_MODULES} -mindepth 1 -maxdepth 1 -type d)

SRC       := $(shell git ls-files)
TS_SRC    := $(filter %.ts,${SRC})
GO_SRC    := $(filter %.go,${SRC})
PROTO_SRC := $(filter %.proto,${SRC})

PULUMI := pulumi

tc: bin/thecluster

deploy: bin/thecluster
	$< deploy

gen: $(PROTO_SRC:proto/%.proto=gen/go/%.pb.go)

tidy: go.mod go.sum ${GO_SRC}
	go mod tidy

pd pinkdiamond: .make/clusters/pinkdiamond_npm_ci
	$(PULUMI) -s ${STACK} -C clusters/pinkdiamond up

cfi cloudflare_ingress: .make/apps/cloudflare-ingress_npm_ci
	$(PULUMI) -s ${CLUSTER} -C apps/cloudflare-ingress up

bin/thecluster: $(filter cmd/%,${GO_SRC})
	go build -o $@ ./cmd/thecluster/main.go

gen/go/%.pb.go: proto/%.proto
	buf generate $?
