import { clusterName, provider, versions } from './config';
import { Deployment } from '@pulumi/kubernetes/apps/v1';
import { Namespace, PersistentVolumeClaim } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('migrate', {
  metadata: { name: 'migrate' },
}, { provider });

const workspaceClaim = new PersistentVolumeClaim('workspace', {
  metadata: {
    name: 'workspace',
    namespace: ns.metadata.name,
  },
  spec: {
    storageClassName: 'unreplicated',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '80Ti',
      },
    },
  },
}, { provider });

const toolbox = new Deployment('ubuntu', {
  metadata: {
    name: 'ubuntu',
    namespace: ns.metadata.name,
  },
  spec: {
    replicas: 1,
    strategy: {
      type: 'Recreate',
    },
    selector: {
      matchLabels: {
        app: 'thecluster-migrate',
      },
    },
    template: {
      metadata: {
        labels: {
          app: 'thecluster-migrate',
        },
      },
      spec: {
        affinity: {
          nodeAffinity: {
            requiredDuringSchedulingIgnoredDuringExecution: {
              nodeSelectorTerms: [{
                matchExpressions: [{
                  key: 'kubernetes.io/hostname',
                  operator: 'In',
                  values: ['gaea'],
                }]
              }],
            },
          },
        },
        // serviceAccountName: 'thecluster-migrate',
        containers: [{
          name: 'thecluster-migrate',
          image: `ubuntu:noble-20240904.1`,
          imagePullPolicy: 'IfNotPresent',
          tty: true,
          // securityContext: {
          //   runAsNonRoot: true,
          //   runAsUser: 1001,
          //   runAsGroup: 1001,
          //   capabilities: {
          //     drop: ['ALL'],
          //   },
          // },
          volumeMounts: [
            { name: 'workspace', mountPath: '/var/thecluster' },
            { name: 'isos', mountPath: '/mnt/isos' },
            { name: 'media', mountPath: '/mnt/media' },
          ],
        }],
        volumes: [
          {
            name: 'workspace',
            persistentVolumeClaim: {
              claimName: workspaceClaim.metadata.name,
            },
          },
          {
            name: 'isos',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media/isos',
            },
          },
          {
            name: 'media',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media',
            },
          },
        ],
      },
    },
  },
}, { provider });
