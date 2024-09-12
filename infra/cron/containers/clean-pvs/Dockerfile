#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.44.3 as yq
FROM bitnami/kubectl:1.31.0-debian-12-r4

COPY --from=yq /usr/bin/yq /usr/bin/yq
COPY clean-pvs.sh /

ENTRYPOINT [ "/clean-pvs.sh" ]
