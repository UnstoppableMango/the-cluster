import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { CsiConfig } from './types';

const clusterId = 'f0f64d5b-8883-4b81-8603-680073516d79';

const ns = new k8s.core.v1.Namespace('ceph-system', {
  metadata: { name: 'ceph-system' },
}, { provider });

const csiConfig: CsiConfig = [{
  clusterID: clusterId,
  monitors: [
    'v2:192.168.1.12:3300/0,v1:192.168.1.12:6789/0',
    'v2:192.168.1.10:3300/0,v1:192.168.1.10:6789/0',
  ],
}];

const chart = new k8s.helm.v3.Chart('ceph-csi', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'ceph-csi-cephfs': {
      csiConfig,
      provisioner: {
        clustername: 'THECLUSTER',
      },
      configMapName: 'ceph-csi-cephfs-config',
      cephConfConfigMapName: 'ceph-cephfs-config',
      storageClass: {
        create: true,
        name: 'cephfs',
        clusterID: clusterId,
        fsName: 'thecluster',
      },
    },
    'ceph-csi-rbd': {
      csiConfig,
      provisioner: {
        clustername: 'THECLUSTER',
      },
      configMapName: 'ceph-csi-rbd-config',
      cephConfConfigMapName: 'ceph-rbd-config',
      storageClass: {
        create: true,
        name: 'rbd',
        clusterID: clusterId,
      },
    },
  },
}, { provider });
