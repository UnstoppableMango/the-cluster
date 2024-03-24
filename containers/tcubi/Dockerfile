#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.43.1 as yq
FROM debian:12-slim
ARG PULUMI_VERSION

COPY --from=yq /usr/bin/yq /usr/bin/yq

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends \
	unzip \
	jq \
	gettext-base \
	&& rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.pulumi.com/ | bash -s -- --version $PULUMI_VERSION
