#syntax=docker/dockerfile:1

FROM ghcr.io/unstoppablemango/tcubi:0.1.0

RUN adduser --disabled-password --gecos "" --uid 1001 runner \
	&& usermod -aG sudo runner \
	&& usermod -aG docker runner \
	&& echo "%sudo   ALL=(ALL:ALL) NOPASSWD:ALL" > /etc/sudoers \
	&& echo "Defaults env_keep += \"DEBIAN_FRONTEND\"" >> /etc/sudoers

WORKDIR /home/runner
USER runner
ENTRYPOINT [ "/bin/bash" ]
