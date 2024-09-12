_ := $(shell mkdir -p .make)
WORKING_DIRECTORY := $(shell pwd)

STACK   := prod
CLUSTER := pinkdiamond

ROOT_MODULES := apps clusters dbs infra
MODULES := $(shell find ${ROOT_MODULES} -mindepth 1 -maxdepth 1 -type d)

SRC    := $(shell git ls-files)
TS_SRC := $(filter %.ts,${SRC})
GO_SRC := $(filter %.go,${SRC})

PULUMI := pulumi

tc: bin/tc

deploy: bin/tc
	$< deploy

tidy: go.mod go.sum ${GO_SRC}
	go mod tidy

pd pinkdiamond: .make/clusters/pinkdiamond_npm_ci
	$(PULUMI) -s ${STACK} -C clusters/pinkdiamond up

cfi cloudflare_ingress: .make/apps/cloudflare-ingress_npm_ci
	$(PULUMI) -s ${CLUSTER} -C apps/cloudflare-ingress up

bin/tc: $(filter cmd/%,${GO_SRC})
	go build -o $@ ./cmd/tc/main.go

$(MODULES:%=.make/%_npm_ci): .make/%_npm_ci:
	cd $* && npm ci
