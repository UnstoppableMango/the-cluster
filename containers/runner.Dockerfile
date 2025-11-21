#syntax=docker/dockerfile:1
# https://github.com/actions/runner/blob/v2.328.0/images/Dockerfile
ARG ACTIONS_RUNNER_VERSION=2.330.0
FROM --platform=${BUILDPLATFORM} ghcr.io/actions/actions-runner:${ACTIONS_RUNNER_VERSION}

USER root

RUN apt-get update \
	&& apt-get install -y make xz-utils \
	&& rm -rf /var/lib/apt/lists/*

USER runner
