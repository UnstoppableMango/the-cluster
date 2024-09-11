_ := $(shell mkdir -p .make)

STACK   := prod
CLUSTER := pinkdiamond

ROOT_MODULES := apps clusters dbs infra
MODULES := $(shell find ${ROOT_MODULES} -mindepth 1 -maxdepth 1 -type d)

SRC    := $(shell git ls-files)
TS_SRC := $(filter %.ts,${SRC})

PULUMI := pulumi

pd pinkdiamond: .make/npm_ci
	$(PULUMI) -s ${STACK} -C clusters/pinkdiamond up

cfi cloudflare_ingress: .make/apps/cloudflare-ingress_npm_ci
	$(PULUMI) -s ${CLUSTER} -C apps/cloudflare-ingress up

$(MODULES:%=.make/%_npm_ci): .make/%_npm_ci:
	cd $* && npm ci
