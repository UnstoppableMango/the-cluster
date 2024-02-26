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
        // nodeSelector: {},
        allowedTopologyKeys: 'kubernetes.io/hostname',
        kubeletDir: '/var/lib/kubelet/',
      },
      crd: {
        volumeSnapshot: false,
      },
    },
  },
}, { provider });
