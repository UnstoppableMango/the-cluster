import * as crds from './crds/ceph/v1';
import { clusterName, provider, versions } from './config';
import { StorageClass } from '@pulumi/kubernetes/storage/v1';

const cluster = new crds.CephCluster(clusterName, {
  metadata: {
    name: clusterName,
    namespace: 'rook',
  },
  spec: {
    cephVersion: {
      image: `quay.io/ceph/ceph:v${versions.ceph}`,
    },
    // This is the default, but I could see myselft wanting to put
    // this on a specific drive in the future
    dataDirHostPath: '/var/lib/rook',
    mon: {
      // https://github.com/rook/rook/blob/0a1dd5e9e619481432cc66347a45072178ca0b48/deploy/examples/cluster.yaml#L51-L52
      count: 3,
    },
    mgr: {
      // https://github.com/rook/rook/blob/0a1dd5e9e619481432cc66347a45072178ca0b48/deploy/examples/cluster.yaml#L58-L60
      count: 2,
    },
    dashboard: {
      enabled: true,
      ssl: false,
    },
    storage: {
      useAllDevices: false,
      useAllNodes: false,
      nodes: [
        { name: 'pik8s4' },
        { name: 'pik8s5' },
        { name: 'pik8s6' },
        { name: 'pik8s8' },
        {
          name: 'gaea',
          devices: [
            { name: 'sda1' },
            { name: 'sdb1' },
            { name: 'sdc1' },
            { name: 'sdd1' },
            { name: 'sde1' },
            { name: 'sdf1' },
            // { name: 'sdg1' },
            // { name: 'sdh1' },
            // { name: 'sdi1' },
            // { name: 'sdj1' },
            // { name: 'sdk1' },
            // { name: 'sdl1' },
            { name: 'sdm1' },
            { name: 'sdn1' },
            { name: 'sdo1' },
            { name: 'sdp1' },
            { name: 'sdq1' },
            { name: 'sds1' },
            { name: 'sdu1' },
          ],
        },
        {
          name: 'zeus',
        },
      ],
    },
  },
}, { provider, protect: true });

const unreplicatedPool = new crds.CephBlockPool('unreplicated', {
  metadata: {
    name: 'unreplicated',
    namespace: 'rook',
  },
  spec: {
    failureDomain: 'osd',
    replicated: {
      size: 1,
    },
  },
}, { provider });

const unreplicatedClass = new StorageClass('unreplicated', {
  metadata: { name: 'unrepliated' },
  provisioner: 'rook.rbd.csi.ceph.com',
  parameters: {
    clusterID: 'rook',
    pool: 'unreplicated',
    'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-rbd-provisioner',
    'csi.storage.k8s.io/provisioner-secret-namespace': 'rook',
    'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-rbd-provisioner',
    'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook',
    'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-rbd-node',
    'csi.storage.k8s.io/node-stage-secret-namespace': 'rook',
    'csi.storage.k8s.io/fstype': 'ext4',
  },
  reclaimPolicy: 'Delete',
  allowVolumeExpansion: true,
}, { provider });
