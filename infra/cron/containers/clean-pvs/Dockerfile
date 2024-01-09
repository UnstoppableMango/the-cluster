#syntax=docker/dockerfile:1

FROM mikefarah/yq:4.40.5 as yq
FROM bitnami/kubectl:1.29-debian-11

COPY --from=yq /usr/bin/yq /usr/bin/yq
COPY clean-pvs.sh /

ENTRYPOINT [ "/clean-pvs.sh" ]
