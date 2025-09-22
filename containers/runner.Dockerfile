#syntax=docker/dockerfile:1
# https://github.com/actions/runner/blob/v2.328.0/images/Dockerfile
FROM ghcr.io/actions/actions-runner:2.328.0

USER root

RUN apt-get update \
	&& apt-get install -y make \
	&& rm -rf /var/lib/apt/lists/*

USER runner
