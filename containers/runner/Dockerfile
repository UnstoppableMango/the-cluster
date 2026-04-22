#syntax=docker/dockerfile:1
# https://github.com/actions/runner/blob/v2.333.1/images/Dockerfile
ARG ACTIONS_RUNNER_VERSION=2.334.0
FROM --platform=${BUILDPLATFORM} ghcr.io/actions/actions-runner:${ACTIONS_RUNNER_VERSION}

USER root

RUN apt-get update \
	&& apt-get install -y \
		make \
		xz-utils \
		fuse-overlayfs \
		podman \
		slirp4netns \
		uidmap \
	&& rm -rf /var/lib/apt/lists/*

# Enable rootless podman: subuid/subgid ranges for runner (uid 1001)
RUN echo "runner:100000:65536" >> /etc/subuid && \
    echo "runner:100000:65536" >> /etc/subgid

# Configure rootless podman storage to use fuse-overlayfs
# Required when running inside a container without kernel overlay support
COPY containers/runner/storage.conf /home/runner/.config/containers/storage.conf
RUN chown -R runner:runner /home/runner/.config

USER runner

# The Cachix action seems to need this
ENV USER=runner
