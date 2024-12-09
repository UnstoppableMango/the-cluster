import * as crds from './crds/ceph/v1';
import { clusterName, provider, versions } from './config';
import { StorageClass } from '@pulumi/kubernetes/storage/v1';
import { Deployment } from '@pulumi/kubernetes/apps/v1';
import { Ingress } from '@pulumi/kubernetes/networking/v1';

const cluster = new crds.CephCluster(clusterName, {
  metadata: {
    name: clusterName,
    namespace: 'rook-ceph',
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
      allowMultiplePerNode: true,
    },
    mgr: {
      // https://github.com/rook/rook/blob/0a1dd5e9e619481432cc66347a45072178ca0b48/deploy/examples/cluster.yaml#L58-L60
      count: 2,
      allowMultiplePerNode: true,
    },
    dashboard: {
      enabled: true,
      ssl: false,
    },
    resources: {
      mon: {
        requests: {
          memory: '1Gi',
        },
        limits: {
          memory: '1Gi',
        },
      },
      mgr: {
        requests: {
          memory: '512Mi',
        },
        limits: {
          memory: '512Mi',
        },
      },
      osd: {
        requests: {
          memory: '4Gi',
        },
        limits: {
          memory: '4Gi',
        },
      },
      crashcollector: {
        requests: {
          memory: '60Mi',
        },
        limits: {
          memory: '60Mi',
        },
      },
      'mgr-sidecar': {
        requests: {
          memory: '40Mi',
        },
        limits: {
          memory: '100Mi',
        },
      },
      exporter: {
        requests: {
          memory: '50Mi',
        },
        limits: {
          memory: '128Mi',
        },
      },
    },
    storage: {
      useAllDevices: false,
      useAllNodes: false,
      nodes: [
        // { name: 'vrk8s1' },
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
          devices: [
            { name: 'sdj1' },
            { name: 'sdk1' },
            { name: 'sdl1' },
            { name: 'sdm1' },
            { name: 'sdn1' },
            { name: 'sdo1' },
          ],
        },
        {
          name: 'castor',
        },
        {
          name: 'pollux',
        },
      ],
    },
  },
}, {
  provider,
  protect: true,
});

const ingress = new Ingress('dashboard', {
  metadata: {
    name: 'rook-ceph-dashboard',
    namespace: 'rook-ceph',
    annotations: {
      'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    ingressClassName: 'thecluster-io',
    rules: [{
      host: 'ceph.thecluster.io',
      http: {
        paths: [{
          pathType: 'Prefix',
          path: '/',
          backend: {
            service: {
              name: 'rook-ceph-mgr-dashboard',
              port: {
                number: 7000,
              },
            },
          },
        }],
      },
    }],
  },
}, { provider });

const mgrPool = new crds.CephBlockPool('mgr', {
  metadata: {
    name: 'mgr',
    namespace: 'rook-ceph',
  },
  spec: {
    name: '.mgr',
    deviceClass: 'hdd',
    failureDomain: 'osd',
    replicated: {
      size: 3,
    },
    parameters: {
      compression_mode: 'none',
    },
    mirroring: {
      enabled: false,
    },
  },
}, {
  provider,
  protect: true,
});

const unsafePool = new crds.CephBlockPool('unsafe-data', {
  metadata: {
    name: 'unsafe-data',
    namespace: 'rook-ceph',
  },
  spec: {
    deviceClass: 'hdd',
    failureDomain: 'osd',
    erasureCoded: {
      dataChunks: 2,
      codingChunks: 1,
    },
  },
}, {
  provider,
  dependsOn: cluster,
  protect: true,
});

const unsafeMetaPool = new crds.CephBlockPool('unsafe-metadata', {
  metadata: {
    name: 'unsafe-metadata',
    namespace: 'rook-ceph',
  },
  spec: {
    deviceClass: 'hdd',
    failureDomain: 'osd',
    replicated: {
      size: 2,
    },
  },
}, {
  provider,
  dependsOn: cluster,
  protect: true,
});

const unsafeRbdClass = new StorageClass('unsafe-rbd', {
  metadata: { name: 'unsafe-rbd' },
  provisioner: 'rook-ceph.rbd.csi.ceph.com',
  parameters: {
    clusterID: 'rook-ceph',
    dataPool: 'unsafe-data',
    pool: 'unsafe-metadata',
    imageFormat: '2',
    imageFeatures: 'layering',
    'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-rbd-provisioner',
    'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
    'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-rbd-provisioner',
    'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
    'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-rbd-node',
    'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
  },
  reclaimPolicy: 'Retain',
  allowVolumeExpansion: true,
}, {
  provider,
  dependsOn: [cluster, unsafePool, unsafeMetaPool],
  protect: true,
});

const replicatedCephfs = new crds.CephFilesystem('replicated', {
  metadata: {
    name: 'replicated',
    namespace: 'rook-ceph',
  },
  spec: {
    metadataPool: {
      replicated: { size: 2 },
    },
    dataPools: [
      {
        name: 'data',
        failureDomain: 'osd',
        replicated: { size: 2 },
      },
    ],
    preserveFilesystemOnDelete: true,
    metadataServer: {
      activeCount: 1,
      activeStandby: true,
    },
  },
}, {
  provider,
  dependsOn: cluster,
  // protect: true,
});

const defaultCephfsClass = new StorageClass('default-cephfs', {
  metadata: { name: 'default-cephfs' },
  provisioner: 'rook-ceph.cephfs.csi.ceph.com',
  parameters: {
    clusterID: 'rook-ceph',
    fsName: 'replicated',
    pool: 'replicated-data',
    'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-cephfs-provisioner',
    'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
    'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-cephfs-provisioner',
    'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
    'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-cephfs-node',
    'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
  },
  reclaimPolicy: 'Retain',
  allowVolumeExpansion: true,
}, {
  provider,
  dependsOn: [cluster, replicatedCephfs],
  protect: true,
});

export const storageClasses = [
  unsafeRbdClass.metadata.name,
  defaultCephfsClass.metadata.name,
];

// https://github.com/rook/rook/blob/master/deploy/examples/toolbox.yaml
const toolbox = new Deployment('toolbox', {
  metadata: {
    name: 'rook-ceph-toolbox',
    namespace: 'rook-ceph',
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
