import { ClusterIssuer } from "@unmango/thecluster-crds/certmanager/v1";
import { provider } from "@unmango/thecluster/cluster/from-stack";

export const issuer = new ClusterIssuer('selfsigned', {
  metadata: { name: 'selfsigned' },
  spec: {
    selfSigned: {},
  },
}, { provider });
