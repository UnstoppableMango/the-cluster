import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Certificate } from '@unmango/thecluster-crds/certmanager/v1';
import { clusterIssuers, provider, shared, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { releaseName, servicePort, versions } from './config';

export const loadBalancerIP = '192.168.1.85';

const ns = Namespace.get(
  'redis',
  shared.namespaces.redis,
  { provider },
);

const cert = new Certificate('redis.thecluster.io', {
  metadata: {
    name: 'redis.thecluster.io',
    namespace: ns.metadata.name,
  },
  spec: {
    secretName: 'redis-tls',
    commonName: 'redis.thecluster.io',
    issuerRef: clusterIssuers.ref(x => x.root),
    ipAddresses: [loadBalancerIP],
    dnsNames: [
      'redis.thecluster.io',
      '*.redis.thecluster.io',
      'redis.lan.thecluster.io',
      '*.redis.lan.thecluster.io',
    ],
    uris: [
      'redis://thecluster.io',
      'redis://*.thecluster.io',
    ],
    subject: {
      organizations: ['UnMango'],
    },
  },
}, { provider });

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
          type: 'LoadBalancer',
          loadBalancerIP,
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
        existingSecret: cert.spec.apply(x => x?.secretName),
        certFilename: 'tls.crt',
        certKeyFilename: 'tls.key',
        certCAFilename: 'ca.crt',
      },
      volumePermissions: { enabled: true },
      useExternalDNS: {
        enabled: true,
        suffix: 'redis.thecluster.io',
      },
    },
  },
}, { provider });

const service = chart.getResource('v1/Service', 'redis/redis');

const serviceOutput = service.metadata.name;
export { versions, serviceOutput as service };
