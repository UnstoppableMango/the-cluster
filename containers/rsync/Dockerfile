#syntax=docker/dockerfile:1

FROM debian:12-slim as build

ARG VERSION=v3.2.7

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends \
	gcc g++ gawk autoconf automake python3-cmarkgfm \
	acl libacl1-dev \
	attr libattr1-dev \
	libxxhash-dev \
	libzstd-dev \
	liblz4-dev \
	libssl-dev \
	make \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /src
ADD https://github.com/WayneD/rsync.git#${VERSION} /src
RUN ./configure && make && make install

FROM debian:12-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends \
	acl libacl1-dev \
	attr libattr1-dev \
	libxxhash-dev \
	libzstd-dev \
	liblz4-dev \
	libssl-dev \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/local/bin/rsync /usr/local/bin/rsync
USER rsync
ENTRYPOINT [ "/usr/local/bin/rsync" ]
