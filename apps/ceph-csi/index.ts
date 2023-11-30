import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { cephfs, clusterId, csi, rbd, versions } from './config';

const ns = new k8s.core.v1.Namespace('ceph-system', {
  metadata: { name: 'ceph-system' },
}, { provider });

new k8s.kustomize.Directory('snapshot-controller', {
  directory: `https://github.com/kubernetes-csi/external-snapshotter/tree/${versions.externalSnapshotter}/deploy/kubernetes/snapshot-controller`,
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

export const rbdClass = chart.getResource('storage.k8s.io/v1/StorageClass', 'rbd').metadata.name;
export const cephfsClass = chart.getResource('storage.k8s.io/v1/StorageClass', 'cephfs').metadata.name;
