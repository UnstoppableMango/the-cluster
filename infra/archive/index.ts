import { Job } from '@pulumi/kubernetes/batch/v1';
import { Namespace, PersistentVolumeClaim } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('archive', {
  metadata: { name: 'archive' },
});

const defaultPvc = new PersistentVolumeClaim('default', {
  metadata: {
    name: 'default',
    namespace: ns.metadata.name,
  },
  spec: {
    accessModes: ['ReadWriteMany'],
    storageClassName: 'default-cephfs',
    resources: {
      requests: {
        storage: '1Ti',
      },
    },
  },
});

const rsyncScript: string = `
#!/bin/bash

export DEBIAN_FRONTEND=noninteractive
apt-get update && apt-get upgrade -y
apt-get install -y rsync
rsync -avuhp --info=progress2 /mnt/src/ /mnt/dst
`;

const rsync = new Job('vm-110', {
  metadata: {
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        nodeSelector: {
          'kubernetes.io/hostname': 'zeus',
        },
        restartPolicy: 'Never',
        containers: [{
          name: 'rsync',
          image: `ubuntu:noble-20240904.1`,
          command: ['bash', '-c', rsyncScript],
          volumeMounts: [
            { name: 'src', mountPath: '/mnt/src' },
            { name: 'dst', mountPath: '/mnt/dst', subPath: 'vms/vm-110-disk-0' },
          ],
          resources: {
            requests: {
              cpu: '100m',
              memory: '4Gi',
            },
            limits: {
              cpu: '8',
              memory: '8Gi',
            },
          },
        }],
        volumes: [
          {
            name: 'dst',
            persistentVolumeClaim: {
              claimName: defaultPvc.metadata.name,
            },
          },
          // {
          //   name: 'src',
          //   nfs: {
          //     server: '192.168.1.10',
          //     path: '/mnt',
          //   },
          // },
          {
            name: 'src',
            hostPath: {
              path: '/mnt',
            },
          },
        ],
      },
    },
  },
}, { dependsOn: defaultPvc });
