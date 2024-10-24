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
}, { provider, dependsOn: cluster });

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
}, { provider, dependsOn: cluster });

const nfsFs = new crds.CephFilesystem('backup', {
  metadata: {
    name: 'backup',
    namespace: 'rook',
  },
  spec: {
    metadataPool: {
      replicated: {
        size: 1,
      },
    },
    dataPools: [{
      name: 'backup',
      replicated: {
        size: 1,
      },
    }],
    preserveFilesystemOnDelete: true,
    metadataServer: {
      activeCount: 1,
      activeStandby: true,
    },
  },
}, { provider, dependsOn: cluster });

const nfs = new crds.CephNFS('backup', {
  metadata: {
    name: 'backup',
    namespace: 'rook',
  },
  spec: {
    server: {
      active: 1,
    },
  },
}, { provider, dependsOn: cluster });

// https://github.com/rook/rook/blob/master/deploy/examples/toolbox.yaml
const toolbox = new Deployment('toolbox', {
  metadata: {
    name: 'toolbox',
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
            `
 # Replicate the script from toolbox.sh inline so the ceph image
# can be run directly, instead of requiring the rook toolbox
CEPH_CONFIG="/etc/ceph/ceph.conf"
MON_CONFIG="/etc/rook/mon-endpoints"
KEYRING_FILE="/etc/ceph/keyring"

# create a ceph config file in its default location so ceph/rados tools can be used
# without specifying any arguments
write_endpoints() {
  endpoints=$(cat \${MON_CONFIG})

# filter out the mon names
# external cluster can have numbers or hyphens in mon names, handling them in regex
# shellcheck disable=SC2001
mon_endpoints=$(echo "\${endpoints}"| sed 's/[a-z0-9_-]\+=//g')

  DATE=$(date)
  echo "$DATE writing mon endpoints to \${CEPH_CONFIG}: \${endpoints}"
    cat <<EOF > \${CEPH_CONFIG}
[global]
mon_host = \${mon_endpoints}

[client.admin]
keyring = \${KEYRING_FILE}
EOF
}

# watch the endpoints config file and update if the mon endpoints ever change
watch_endpoints() {
  # get the timestamp for the target of the soft link
  real_path=$(realpath \${MON_CONFIG})
  initial_time=$(stat -c %Z "\${real_path}")
  while true; do
    real_path=$(realpath \${MON_CONFIG})
    latest_time=$(stat -c %Z "\${real_path}")

    if [[ "\${latest_time}" != "\${initial_time}" ]]; then
      write_endpoints
      initial_time=\${latest_time}
    fi

    sleep 10
  done
}

# read the secret from an env var (for backward compatibility), or from the secret file
ceph_secret=\${ROOK_CEPH_SECRET}
if [[ "$ceph_secret" == "" ]]; then
  ceph_secret=$(cat /var/lib/rook-ceph-mon/secret.keyring)
fi

# create the keyring file
cat <<EOF > \${KEYRING_FILE}
[\${ROOK_CEPH_USERNAME}]
key = \${ceph_secret}
EOF

# write the initial config file
write_endpoints

# continuously update the mon endpoints if they fail over
watch_endpoints`,
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
});
