#syntax=docker/dockerfile:1

FROM golang:1.22 as build

# renovate depName=pulumi/pulumi-kubernetes-operator
ARG VERSION=v1.14.0

ADD https://github.com/pulumi/pulumi-kubernetes-operator.git#${VERSION} /src

ENV GO111MODULE=on
ENV GOOS=linux
ENV CGO_ENABLED=0

RUN cd /src && go build \
    -o pulumi-kubernetes-operator \
    -ldflags "-X github.com/pulumi/pulumi-kubernetes-operator/version.Version=${VERSION} -w -extldflags \"-static\"" \
    -tags netgo \
    ./cmd/manager/main.go \
    && chmod +x pulumi-kubernetes-operator

FROM pulumi/pulumi-nodejs:3.105.0

RUN apt-get install tini
ENTRYPOINT ["tini", "--", "/usr/local/bin/pulumi-kubernetes-operator"]

COPY --from=build /src/pulumi-kubernetes-operator /usr/local/bin/pulumi-kubernetes-operator

RUN useradd -m pulumi-kubernetes-operator
RUN mkdir -p /home/pulumi-kubernetes-operator/.ssh \
    && touch /home/pulumi-kubernetes-operator/.ssh/known_hosts \
    && chmod 700 /home/pulumi-kubernetes-operator/.ssh \
    && chown -R pulumi-kubernetes-operator:pulumi-kubernetes-operator /home/pulumi-kubernetes-operator/.ssh

USER pulumi-kubernetes-operator

ENV XDG_CONFIG_HOME=/tmp/.config
ENV XDG_CACHE_HOME=/tmp/.cache
ENV XDG_CONFIG_CACHE=/tmp/.cache
ENV GOCACHE=/tmp/.cache/go-build
ENV GOPATH=/tmp/.cache/go
