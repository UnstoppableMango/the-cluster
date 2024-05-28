#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.44.1 as yq
FROM pulumi/pulumi:3.116.1

COPY --from=yq /usr/bin/yq /usr/bin/yq

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends \
	unzip \
	jq \
	gettext-base \
	&& rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --gecos "" --uid 1001 runner \
	&& usermod -aG sudo runner \
	&& usermod -aG docker runner \
	&& echo "%sudo   ALL=(ALL:ALL) NOPASSWD:ALL" > /etc/sudoers \
	&& echo "Defaults env_keep += \"DEBIAN_FRONTEND\"" >> /etc/sudoers

WORKDIR /home/runner
USER runner
ENTRYPOINT [ "/bin/bash" ]
