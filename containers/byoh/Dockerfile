#syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM golang:1.20.7 as builder

ARG TARGETARCH

WORKDIR /workspace
ADD https://github.com/vmware-tanzu/cluster-api-provider-bringyourownhost.git .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=$TARGETARCH go build -a -o manager main.go

FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=builder /workspace/manager .
USER 65532:65532

ENTRYPOINT ["/manager"]
