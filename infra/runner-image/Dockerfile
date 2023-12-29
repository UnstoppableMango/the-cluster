#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.40.5 as yq
FROM pulumi/pulumi-nodejs:3.99.0-debian

COPY --from=yq /usr/bin/yq /usr/bin/yq

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends \
	unzip \
	jq \
	gettext-base \
	make \
	&& rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --gecos "" --uid 1001 runner \
    && groupadd docker --gid 123 \
    && usermod -aG sudo runner \
    && usermod -aG docker runner \
    && echo "%sudo   ALL=(ALL:ALL) NOPASSWD:ALL" > /etc/sudoers \
    && echo "Defaults env_keep += \"DEBIAN_FRONTEND\"" >> /etc/sudoers

WORKDIR /home/runner
USER runner
