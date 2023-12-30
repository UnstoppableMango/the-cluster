import * as fs from 'node:fs/promises';
import { interpolate } from '@pulumi/pulumi';
import { core } from '@pulumi/kubernetes/types/input';
import { ConfigMap, Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { ingresses, provider, realms, shared, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { client, readersGroup } from './oauth';
import { hosts, releaseName, servicePort, versions } from './config';

type Volume = core.v1.Volume;
type VolumeMount = core.v1.VolumeMount;

const ns = Namespace.get(
  'redis',
  shared.namespaces.redis,
  { provider },
);

// const config = new ConfigMap('redis', {
//   metadata: {
//     name: 'redis',
//     namespace: ns.metadata.name,
//   },
//   data: {
//     'config.json': fs.readFile('assets/config.json', 'utf-8'),
//   },
// }, { provider });

const chart = new Chart(releaseName, {
  path: './',
  namespace: ns.metadata.name,
  values: {
    redis: {
      global: {
        imageRegistry: 'docker.io',
        storageClass: storageClasses.rbd,
      },
      image: {
        repository: 'bitnami/redis',
        tag: versions.redis,
      },
      auth: { enabled: false },
      master: {
        // resources: {
        //   limits: {
        //     cpu: '',
        //     memory: '',
        //   },
        //   requests: {
        //     cpu: '',
        //     memory: '',
        //   },
        // },
        containerSecurityContext: {
          runAsUser: 1001,
          runAsNonRoot: true,
          allowPrivilegeEscalation: false,
        },
        // priorityClassName: 'system-cluster-critical',
        persistence: {
          accessModes: ['ReadWriteOnce'],
          size: '15Gi',
        },
        persistentVolumeClaimRetentionPolicy: {
          enabled: true,
          whenScaled: 'Retain',
          whenDeleted: 'Delete',
        },
        service: {
          type: 'ClusterIP',
          ports: {
            redis: servicePort,
          },
        },
      },
      replica: {
        kind: 'DaemonSet',
        // resources: {
        //   limits: {
        //     cpu: '',
        //     memory: '',
        //   },
        //   requests: {
        //     cpu: '',
        //     memory: '',
        //   },
        // },
        podSecurityContext: {
          fsGroup: 1001,
        },
        containerSecurityContext: {
          runAsUser: 1001,
          runAsNonRoot: true,
          allowPrivilegeEscalation: false,
        },
        persistence: {
          accessModes: ['ReadWriteOnce'],
          size: '8Gi',
        },
        persistentVolumeClaimRetentionPolicy: {
          enabled: true,
          whenScaled: 'Retain',
          whenDeleted: 'Delete',
        },
        service: {
          type: 'ClusterIP',
          ports: {
            redis: servicePort,
          },
        },
      },
      tls: {
        enabled: true,
        // existingSecret: '',
        certFilename: '',
        certKeyFilename: '',
        certCAFilename: '',
      },
      volumePermissions: { enabled: true },
      useExternalDNS: { enabled: true, suffix: 'lan.thecluster.io' },
    },
  },
}, { provider });

const service = chart.getResource('v1/Service', 'media/redis');

const serviceOutput = service.metadata.name;
export { hosts, versions, serviceOutput as service };
