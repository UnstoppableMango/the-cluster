import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { issuer } from '@unmango/thecluster/apps/cert-manager';

const ns = new k8s.core.v1.Namespace('kong-system', {
  metadata: { name: 'kong-system' },
}, { provider });

const chart = new k8s.helm.v3.Chart('kong', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    kong: {
      admin: {
        enabled: true,
      },
      certificates: {
        enabled: true,
        clusterIssuer: issuer,
      },
      env: {
        admin_listen: 6969, // TODO
      },
    },
  },
}, { provider });
