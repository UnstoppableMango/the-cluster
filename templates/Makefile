WORKING_DIR := $(shell git rev-parse --show-toplevel)/templates

clean:
	find ${WORKING_DIR} \
	\( -name 'package.lock.json' -o -name 'node_modules' \) \
	-delete
