SHELL := /bin/bash

GEN_DIR := templates/generated
CRDS_DIR := crds
MANIFESTS := $(wildcard $(GEN_DIR)/*.yaml) $(wildcard $(CRDS_DIR)/*.yaml)

all:
	@gen/templates.sh

$(MANIFESTS): all

clean:
	-rm -r $(GEN_DIR)
	-rm -r $(CRDS_DIR)
