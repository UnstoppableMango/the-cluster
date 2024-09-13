#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.44.3 as yq
FROM bitnami/kubectl:1.31.1-debian-12-r0

COPY --from=yq /usr/bin/yq /usr/bin/yq
COPY clean-pvs.sh /

ENTRYPOINT [ "/clean-pvs.sh" ]
