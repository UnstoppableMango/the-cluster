import * as crds from './crds/ceph/v1';
import { clusterName, provider, versions } from './config';
import { StorageClass } from '@pulumi/kubernetes/storage/v1';
import { Deployment } from '@pulumi/kubernetes/apps/v1';

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
        // { name: 'pik8s4' },
        // { name: 'pik8s5' },
        // { name: 'pik8s6' },
        { name: 'pik8s8' },
        { name: 'vrk8s1' },
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
      requireSafeReplicaSize: false,
    },
  },
}, { provider, dependsOn: cluster, protect: true });

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
}, { provider, dependsOn: cluster, protect: true });

const backupFs = new crds.CephFilesystem('backup', {
  metadata: {
    name: 'backup',
    namespace: 'rook',
  },
  spec: {
    metadataPool: {
      replicated: {
        size: 1,
        requireSafeReplicaSize: false,
      },
    },
    dataPools: [{
      name: 'backup',
      failureDomain: 'osd',
      replicated: {
        size: 1,
        requireSafeReplicaSize: false,
      },
    }],
    preserveFilesystemOnDelete: true,
    metadataServer: {
      activeCount: 1,
      activeStandby: true,
    },
  },
}, { provider, dependsOn: cluster });

// const nfs = new crds.CephNFS('backup', {
//   metadata: {
//     name: 'backup',
//     namespace: 'rook',
//   },
//   spec: {
//     server: {
//       active: 1,
//     },
//     security: {},
//   },
// }, { provider, dependsOn: [cluster, backupFs] });

// https://github.com/rook/rook/blob/master/deploy/examples/toolbox.yaml
const toolbox = new Deployment('toolbox', {
  metadata: {
    name: 'rook-ceph-toolbox',
    namespace: 'rook',
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        app: 'rook-ceph-tools',
      },
    },
    template: {
      metadata: {
        labels: {
          app: 'rook-ceph-tools',
        },
      },
      spec: {
        dnsPolicy: 'ClusterFirstWithHostNet',
        serviceAccountName: 'rook-ceph-default',
        containers: [{
          name: 'rook-ceph-tools',
          image: `quay.io/ceph/ceph:v${versions.ceph}`,
          command: [
            '/bin/bash',
            '-c',
            toolboxScript(versions.rook),
          ],
          imagePullPolicy: 'IfNotPresent',
          tty: true,
          securityContext: {
            runAsNonRoot: true,
            runAsUser: 2016,
            runAsGroup: 2016,
            capabilities: {
              drop: ['ALL'],
            },
          },
          env: [{
            name: 'ROOK_CEPH_USERNAME',
            valueFrom: {
              secretKeyRef: {
                name: 'rook-ceph-mon',
                key: 'ceph-username',
              },
            },
          }],
          volumeMounts: [
            { name: 'ceph-config', mountPath: '/etc/ceph' },
            { name: 'mon-endpoint-volume', mountPath: '/etc/rook' },
            { name: 'ceph-admin-secret', mountPath: '/var/lib/rook-ceph-mon', readOnly: true },
          ],
        }],
        volumes: [
          {
            name: 'ceph-admin-secret',
            secret: {
              secretName: 'rook-ceph-mon',
              optional: false,
              items: [
                { key: 'ceph-secret', path: 'secret.keyring' },
              ],
            },
          },
          {
            name: 'mon-endpoint-volume',
            configMap: {
              name: 'rook-ceph-mon-endpoints',
              items: [
                { key: 'data', path: 'mon-endpoints' },
              ],
            },
          },
          { name: 'ceph-config', emptyDir: {} },
        ],
        tolerations: [{
          key: 'node.kubernetes.io/unreachable',
          operator: 'Exists',
          effect: 'NoExecute',
          tolerationSeconds: 5,
        }],
      },
    },
  },
}, { provider, dependsOn: [cluster] });

function toolboxScript(version: string): Promise<string> {
  const baseUrl = 'https://raw.githubusercontent.com';
  const script = 'images/ceph/toolbox.sh';
  const url = `${baseUrl}/rook/rook/refs/tags/v${version}/${script}`;

  return fetch(url).then(x => x.text());
}
