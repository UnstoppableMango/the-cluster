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

deploy: bin/deploy
	$<

tidy:
	go -C cmd mod tidy

pd pinkdiamond: .make/clusters/pinkdiamond_npm_ci
	$(PULUMI) -s ${STACK} -C clusters/pinkdiamond up

cfi cloudflare_ingress: .make/apps/cloudflare-ingress_npm_ci
	$(PULUMI) -s ${CLUSTER} -C apps/cloudflare-ingress up

bin/deploy: $(filter cmd/%,${GO_SRC})
	go -C cmd build -o ${WORKING_DIRECTORY}/$@ ./deploy/main.go

$(MODULES:%=.make/%_npm_ci): .make/%_npm_ci:
	cd $* && npm ci
