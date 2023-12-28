import * as k8s from '@pulumi/kubernetes';
import { PersistentVolumeClaim } from '@pulumi/kubernetes/core/v1';
import { provider, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { range } from '@unmango/thecluster';
import { actionsRunnerController, volumes } from './config';

const runnerVolumes = range(actionsRunnerController.count)
  .map(i => i + 1)
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
        accessModes: ['ReadWriteMany'],
        storageClassName: storageClasses.rbd,
        csi: {
          driver: 'rbd.csi.ceph.com',
          volumeHandle: name,
        },
        volumeMode: 'Filesystem',
        capacity: {
          storage: '10Gi',
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
  }, { provider });
});

const volumesOutput = [
  ...runnerVolumes.map(x => x.metadata.name),
];

const claimsOutput = [
  ...claims.map(x => x.metadata.name),
]

export {
  volumesOutput as volumes,
  claimsOutput as claims,
};
