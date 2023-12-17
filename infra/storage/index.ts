import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { provider, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { range, required } from '@unmango/thecluster';
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
        storageClassName: storageClasses.cephfs,
        csi: {
          driver: 'cephfs.csi.ceph.com',
          volumeHandle: name,
        },
        volumeMode: 'Filesystem',
        capacity: {
          storage: '10Gi',
        },
      },
    }, { provider });
  });

const persistentVolumes = volumes.map(config => {
  const id = new random.RandomUuid(config.name, {
    keepers: { name: config.name },
  });

  const labels: Record<string, pulumi.Input<string>> = {};
  if (config.fsType) labels['thecluster.io/role'] = config.fsType;

  return new k8s.core.v1.PersistentVolume(config.name, {
    metadata: {
      name: pulumi.interpolate`${config.name}-${id.result}`,
      labels,
    },
    spec: {
      accessModes: config.accessModes,
      storageClassName: config.storageClass,
      csi: {
        driver: driverFor(config.storageClass),
        volumeHandle: pulumi.interpolate`${config.name}-${id.result}`,
        fsType: config.fsType,
      },
      volumeMode: config.mode,
      capacity: {
        storage: config.size,
      },
    },
  }, { provider });
});

function driverFor(storageClass: string): pulumi.Output<string> {
  // TODO: I'm struggle bussing
  return pulumi.output(storageClasses).apply(x => {
    return new Map([
      ['cephfs', 'cephfs.csi.ceph.com'],
      ['rbd', 'rbd.csi.ceph.com'],
    ]).get(storageClass);
  }).apply(required);
}
