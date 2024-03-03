import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { provider } from './config';

const ns = new Namespace('zfs-localpv', {
  metadata: { name: 'zfs-localpv' },
}, { provider });

const chart = new Chart('zfs-localpv', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'zfs-localpv': {
      analytics: { enabled: false },
      zfsNode: {
        kubeletDir: '/var/lib/kubelet/',
        nodeSelector: {
          'thecluster.io/zfs': 'true',
        },
      },
      crd: {
        volumeSnapshot: false,
      },
    },
  },
}, { provider });
