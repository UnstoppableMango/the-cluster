import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { versions } from './config';

const ns = new k8s.core.v1.Namespace('{{.Project}}', {
  metadata: { name: '{{.Project}}' },
}, { provider });

const chart = new k8s.helm.v3.Chart('{{.Project}}', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    '{{.Project}}': {
      env: {},
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    },
  },
}, { provider });
