#syntax=docker/dockerfile:1

FROM golang:1.21.5 as builder
ARG VERSION=v4.40.5

WORKDIR /go/src/mikefarah/yq
ADD https://github.com/mikefarah/yq.git#${VERSION} .
RUN CGO_ENABLED=0 go build -ldflags "-s -w" .
RUN ./scripts/acceptance.sh

FROM debian:12-slim
COPY --from=builder /go/src/mikefarah/yq/yq /usr/bin/yq

WORKDIR /workdir

RUN set -eux; \
  addgroup -g 1001 yq; \
  adduser -u 1001 -G yq -s /bin/sh -h /home/yq -D yq

RUN chown -R yq:yq /workdir

USER yq
ENTRYPOINT ["/usr/bin/yq"]
