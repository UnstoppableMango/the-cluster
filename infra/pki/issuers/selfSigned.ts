import { ClusterIssuer } from "@unstoppablemango/thecluster-crds/certmanager/v1";
import { provider } from "@unstoppablemango/thecluster/cluster/from-stack";

export const issuer = new ClusterIssuer('selfsigned', {
  metadata: { name: 'selfsigned' },
  spec: {
    selfSigned: {},
  },
}, { provider });
