import { Namespace } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { Issuer } from "@unmango/thecluster-crds/certmanager/v1";

const ns = new Namespace('postgres', {
  metadata: {
    name: 'postgres',
    labels: {
      'thecluster.io/inject-postgres-cert': 'true',
    },
  },
}, { provider });

export const issuer = new Issuer(hostname, {
  metadata: {
    name: hostname,
    namespace: ns.metadata.name,
  },
  spec: {
    ca: {
      secretName: secret.metadata.name,
    },
  },
}, { provider });
