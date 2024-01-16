import * as k8s from '@pulumi/kubernetes';
import { Namespace, PersistentVolumeClaim, Secret } from '@pulumi/kubernetes/core/v1';
import { apps, provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { range } from '@unstoppablemango/thecluster';
import { actionsRunnerController, cephfs, volumes } from './config';
import { interpolate } from '@pulumi/pulumi';

const cephNs = Namespace.get('ceph', 'ceph-system', { provider });

const rbdSecret = Secret.get('rbd', interpolate`${cephNs.metadata.name}/csi-rbd-secret`, { provider });
const cephfsSecret = Secret.get('cephfs', interpolate`${cephNs.metadata.name}/csi-cephfs-secret`, { provider });

const cephfsPvSecret = new Secret('csi-cephfs-pv-secret', {
  metadata: {
    name: 'csi-cephfs-pv-secret',
    namespace: cephNs.metadata.name,
  },
  data: {
    adminID: cephfsSecret.data['adminID'],
    adminKey: cephfsSecret.data['adminKey'],
  },
  stringData: {
    userID: cephfs.userId,
    userKey: cephfs.userKey,
  },
}, { provider });

// For rbd:
// `for i in $(seq -f "%02g" 1 25); do rbd create "actions-runner-$i" --size 100Gi --pool kubernetes; done`
// For cephfs:
// `ceph fs subvolumegroup create kubernetes actions-runners`
// `for i in $(seq -f "%02g" 1 25); do ceph fs subvolume create kubernetes "actions-runner-$i" actions-runners --size 107374182400 --uid 1001 --gid 1001; done`
const runnerVolumes = range(actionsRunnerController.count)
  .map(i => String(i + 1).padStart(2, '0')) // 1 based index
  .map(i => {
    const name = `actions-runner-cache-${i}`;
    return new k8s.core.v1.PersistentVolume(name, {
      metadata: {
        name,
        labels: {
          'thecluster.io/role': 'actions-runner',
        },
      },
      spec: {
        // https://github.com/ceph/ceph-csi/blob/devel/docs/static-pvc.md
        accessModes: ['ReadWriteMany'],
        csi: {
          driver: 'cephfs.csi.ceph.com',
          volumeHandle: name,
          nodeStageSecretRef: {
            name: cephfsPvSecret.metadata.name,
            namespace: cephfsPvSecret.metadata.namespace,
          },
          volumeAttributes: {
            clusterID: apps.cephCsi.clusterId,
            fsName: 'kubernetes',
            staticVolume: 'true',
            // `actions-runners` is the subvolumegroup from the create commands
            rootPath: `/volumes/actions-runners/actions-runner-${i}`,
          },
        },
        persistentVolumeReclaimPolicy: 'Retain',
        volumeMode: 'Filesystem',
        capacity: {
          storage: '100Gi',
        },
      },
    }, { provider });
  });

const claims = volumes.map(config => {
  return new PersistentVolumeClaim(config.name, {
    metadata: {
      name: config.name,
      namespace: config.namespace,
      labels: config.labels,
    },
    spec: {
      accessModes: config.accessModes,
      storageClassName: config.storageClass,
      volumeMode: config.mode,
      resources: {
        requests: {
          storage: config.size,
        },
      },
    },
  }, { provider, protect: true });
});

// const runnerVolumesOutput = runnerVolumes.map(x => x.metadata.name);

const claimsOutput = [
  ...claims.map(x => x.metadata.name),
]

export {
  // runnerVolumesOutput as runnerVolumes,
  claimsOutput as claims,
};
