#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.40.5 as yq
FROM pulumi/pulumi-nodejs:3.99.0-debian

COPY --from=yq /usr/bin/yq /usr/bin/yq

RUN DEBIAN_FRONTEND=noninteractive \
	apt-get update && \
	apt-get install -y unzip jq gettext-base && \
	rm -rf /var/lib/apt/lists/* && \
	git config --global --add safe.directory "$HOME/_work" && \
	git config --global --add safe.directory "/__w"
