import * as k8s from '@pulumi/kubernetes';
import { PersistentVolumeClaim, Secret } from '@pulumi/kubernetes/core/v1';
import { apps, provider, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { range } from '@unmango/thecluster';
import { actionsRunnerController, volumes } from './config';

const rbdSecret = Secret.get('rbd', 'ceph-system/csi-rbd-secret', { provider });

const runnerVolumes = range(actionsRunnerController.count)
  .map(i => i + 1) // 1 based index
  .map(i => {
    const name = `actions-runner-${String(i).padStart(2, '0')}`;
    return new k8s.core.v1.PersistentVolume(name, {
      metadata: {
        name,
        labels: {
          'thecluster.io/role': 'actions-runner',
        },
      },
      spec: {
        // https://github.com/ceph/ceph-csi/blob/devel/docs/static-pvc.md
        // for i in $(seq -f "%02g" 1 30); do rbd create actions-runner-$i --size 100Gi --pool kubernetes; done
        accessModes: ['ReadWriteOnce'],
        csi: {
          driver: 'rbd.csi.ceph.com',
          volumeHandle: name,
          fsType: 'ext4',
          controllerExpandSecretRef: {
            name: rbdSecret.metadata.name,
            namespace: rbdSecret.metadata.namespace,
          },
          nodeStageSecretRef: {
            name: rbdSecret.metadata.name,
            namespace: rbdSecret.metadata.namespace,
          },
          volumeAttributes: {
            clusterID: apps.cephCsi.clusterId,
            pool: 'kubernetes',
            staticVolume: 'true',
            imageFeatures: 'layering',
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

// const volumesOutput = [
//   ...runnerVolumes.map(x => x.metadata.name),
// ];

const claimsOutput = [
  ...claims.map(x => x.metadata.name),
]

export {
  // volumesOutput as volumes,
  claimsOutput as claims,
};
