import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { cephfs, clusterId, csi, rbd } from './config';

const ns = new k8s.core.v1.Namespace('ceph-system', {
  metadata: { name: 'ceph-system' },
}, { provider });

const chart = new k8s.helm.v3.Chart('ceph-csi', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'ceph-csi-cephfs': {
      csiConfig: csi,
      provisioner: {
        clustername: 'THECLUSTER',
      },
      configMapName: 'ceph-csi-cephfs-config',
      cephConfConfigMapName: 'ceph-cephfs-config',
      selinuxMount: false, // Talos doesn't seem to support this
      secret: {
        create: true,
        adminID: cephfs.adminId,
        adminKey: cephfs.adminKey,
      },
      storageClass: {
        create: true,
        name: 'cephfs',
        clusterID: clusterId,
        fsName: 'kubernetes',
      },
    },
    'ceph-csi-rbd': {
      csiConfig: csi,
      provisioner: {
        clustername: 'THECLUSTER',
      },
      configMapName: 'ceph-csi-rbd-config',
      cephConfConfigMapName: 'ceph-rbd-config',
      selinuxMount: false, // Talos doesn't seem to support this
      secret: {
        create: true,
        userID: rbd.userId,
        userKey: rbd.userKey,
      },
      storageClass: {
        create: true,
        name: 'rbd',
        clusterID: clusterId,
        pool: 'kubernetes',
        annotations: {
          'storageclass.kubernetes.io/is-default-class': 'true',
        },
      },
    },
  },
}, { provider });
