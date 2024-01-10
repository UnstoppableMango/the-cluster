import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Certificate } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { clusterIssuers, provider, shared, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import { releaseName, servicePort, versions } from './config';
import { CustomResourceOptions } from '@pulumi/pulumi';

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
    'redis-cluster': {
      global: {
        imageRegistry: 'docker.io',
        storageClass: storageClasses.rbd,
      },
      image: {
        repository: 'bitnami/redis-cluster',
        tag: versions.redis,
      },
      usePassword: false,
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
        ports: { redis: servicePort },
        annotations: {
          'external-dns.alpha.kubernetes.io/hostname': 'redis.lan.thecluster.io',
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
      redis: {
        resources: {
          limits: {
            cpu: '250m',
            memory: '2Gi',
          },
          requests: {
            cpu: '100m',
            memory: '512Mi',
          },
        },
      },
      cluster: {
        nodes: 9,
        replicas: 2,
      },
      // Might want this when Talos supports it
      sysctlImage: { enabled: false },
    },
  },
  transformations: [(obj: any, opts: CustomResourceOptions) => {
    opts.dependsOn = cert;
  }],
}, { provider });

const service = chart.getResource('v1/Service', 'redis/redis-redis-cluster-headless');

const serviceOutput = service.metadata.name;
export { versions, servicePort as port, serviceOutput as service };
