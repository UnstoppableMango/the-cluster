import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { rbdStorageClass } from '@unmango/thecluster/apps/ceph-csi';

const ns = new k8s.core.v1.Namespace('storage', {
  metadata: { name: 'storage' },
}, { provider });

const testPvc = new k8s.core.v1.PersistentVolumeClaim('test', {
  metadata: {
    name: 'test',
    namespace: ns.metadata.name,
  },
  spec: {
    storageClassName: rbdStorageClass,
    volumeMode: 'Block',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '15Gi',
      },
    },
  },
}, { provider });
