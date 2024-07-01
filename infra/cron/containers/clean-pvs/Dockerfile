#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.44.1 as yq
FROM bitnami/kubectl:1.30.2-debian-12-r1

COPY --from=yq /usr/bin/yq /usr/bin/yq
COPY clean-pvs.sh /

ENTRYPOINT [ "/clean-pvs.sh" ]
