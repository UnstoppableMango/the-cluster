#syntax=docker/dockerfile:1
# https://github.com/actions/runner/blob/v2.330.0/images/Dockerfile
ARG ACTIONS_RUNNER_VERSION=2.333.1
FROM --platform=${BUILDPLATFORM} ghcr.io/actions/actions-runner:${ACTIONS_RUNNER_VERSION}@sha256:b57864c9fcda15ea4a270446aa9cfb108b819a26f6e71fc515f6caf6c27989c6

USER root

RUN apt-get update \
	&& apt-get install -y make xz-utils \
	&& rm -rf /var/lib/apt/lists/*

USER runner

# The Cachix action seems to need this
ENV USER=runner
