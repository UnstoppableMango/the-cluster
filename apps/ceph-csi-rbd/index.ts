import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';

const ns = new k8s.core.v1.Namespace('rbd-system', {
  metadata: { name: 'rbd-system' },
});

const chart = new k8s.helm.v3.Chart('ceph', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'ceph-csi-rbd': {
    },
  },
}, { provider });
