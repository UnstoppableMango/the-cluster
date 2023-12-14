import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
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
      nodeplugin: {
        tolerations: [{
          key: 'node-role.kubernetes.io/control-plane',
          operator: 'Exists',
          effect: 'NoSchedule',
        }],
      },
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
      // https://github.com/ceph/ceph-csi/issues/4297
      readAffinity: {
        enabled: false,
      },
    },
    'ceph-csi-rbd': {
      csiConfig: csi,
      nodeplugin: {
        tolerations: [{
          key: 'node-role.kubernetes.io/control-plane',
          operator: 'Exists',
          effect: 'NoSchedule',
        }],
      },
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
      // https://github.com/ceph/ceph-csi/issues/4297
      readAffinity: {
        enabled: false,
      },
    },
  },
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    // https://github.com/ceph/ceph-csi/issues/4306
    if (obj.kind !== 'ClusterRole') return;
    const targets = [
      'ceph-csi-ceph-csi-cephfs-nodeplugin',
      'ceph-csi-ceph-csi-rbd-nodeplugin',
      'ceph-csi-ceph-csi-rbd-provisioner',
    ];
    if (!targets.includes(obj.metadata.name)) return;
    if (!obj.rules) obj.rules = [];
    obj.rules.push({ apiGroups: [''], resources: ['nodes'], verbs: ['get', 'list', 'watch'] });
  }],
}, { provider });

export const rbdClass = chart.getResource('storage.k8s.io/v1/StorageClass', 'rbd').metadata.name;
export const cephfsClass = chart.getResource('storage.k8s.io/v1/StorageClass', 'cephfs').metadata.name;
