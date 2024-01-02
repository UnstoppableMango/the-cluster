import * as fs from 'node:fs/promises';
import { interpolate } from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { Namespace, Service } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Certificate } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { clusterIssuers, provider, shared, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import {
  adminPasswordKey,
  architecture,
  exporterRepository,
  gid,
  hosts,
  loadBalancerIP,
  metricsPort,
  osShellRepository,
  postgresPort,
  primaryDatabase,
  registry,
  releaseName,
  repository,
  resources,
  serviceName,
  tlsSecretName,
  uid,
  versions,
} from './config';

const ns = Namespace.get('postgres', shared.postgresNamespace, { provider });
export { primaryDatabase, hosts, loadBalancerIP as ip, postgresPort as port };

const adminPassword = new random.RandomPassword('postgres', {
  length: 48,
  special: false,
});

const secret = new k8s.core.v1.Secret('postgres', {
  metadata: {
    name: 'postgres',
    namespace: ns.metadata.name,
  },
  stringData: {
    [adminPasswordKey]: adminPassword.result,
  },
}, { provider });

const cert = new Certificate('postgres', {
  metadata: {
    name: 'postgres',
    namespace: ns.metadata.name,
  },
  spec: {
    secretName: tlsSecretName,
    issuerRef: clusterIssuers.ref(x => x.postgres),
    duration: '2160h0m0s', // 90d
    renewBefore: '360h0m0s', // 15d
    commonName: 'postgres',
    subject: {
      organizations: ['unmango'],
    },
    privateKey: {
      algorithm: 'RSA',
      encoding: 'PKCS1',
      size: 2048,
      rotationPolicy: 'Always',
    },
    usages: [
      'server auth',
      'client auth',
    ],
    ipAddresses: [loadBalancerIP],
    dnsNames: [
      hosts.external,
      'postgres-ha.thecluster.io',
      'postgres-la.thecluster.io',
      'pgha.thecluster.io',
      'pgla.thecluster.io',
      'pg.thecluster.io',
      hosts.internal,
      'postgres-ha.lan.thecluster.io',
      'postgres-la.lan.thecluster.io',
      'pgha.lan.thecluster.io',
      'pgla.lan.thecluster.io',
      'pg.lan.thecluster.io',
      serviceName,
      interpolate`${serviceName}.${ns.metadata.name}`,
      `${serviceName}.cluster.local`,
      `${serviceName}.svc.cluster.local`,
      `${serviceName}.thecluster.io`,
      `${serviceName}.lan.thecluster.io`,
    ],
  },
}, { provider });

const chart = new Chart(releaseName, {
  path: './',
  namespace: ns.metadata.name,
  values: {
    postgresql: {
      image: {
        registry,
        repository,
        tag: versions.bitnamiPostgresql,
      },
      auth: {
        database: primaryDatabase,
        existingSecret: secret.metadata.name,
        secretKeys: {
          adminPasswordKey,
        },
      },
      architecture,
      tls: {
        enabled: true,
        certificatesSecret: tlsSecretName,
        certFilename: 'tls.crt',
        certKeyFilename: 'tls.key',
        certCAFilename: 'ca.crt',
      },
      primary: {
        pgHbaConfiguration: fs.readFile('assets/pg_hba.conf', 'utf-8'),
        resources,
        podSecurityContext: {
          fsGroup: gid,
        },
        containerSecurityContext: {
          runAsUser: uid,
        },
        priorityClassName: 'system-cluster-critical',
        service: {
          type: 'LoadBalancer',
          loadBalancerIP,
          annotations: {
            'external-dns.alpha.kubernetes.io/hostname': hosts.internal,
          },
        },
        persistence: {
          size: '100Gi',
          storageClass: storageClasses.rbd,
        },
        persistentVolumeClaimRetentionPolicy: {
          enabled: false,
          whenScaled: 'Retain',
          whenDeleted: 'Retain',
        },
      },
      volumePermissions: {
        enabled: true,
        image: {
          registry,
          repository: osShellRepository,
          tag: versions.bitnamiOsShell,
        },
        resources: {
          limits: {
            cpu: '10m',
            memory: '64Mi',
          },
          requests: {
            cpu: '10m',
            memory: '64Mi',
          },
        },
      },
      // An imaginary top-level service exists
      // that configures both primary and read
      service: {
        ports: {
          postgresql: postgresPort,
        },
      },
      serviceAccount: { create: true },
      rbac: { create: true },
      metrics: {
        enabled: false,
        image: {
          registry,
          repository: exporterRepository,
          tag: versions.bitnamiExporter,
        },
        containerSecurityContext: {
          runAsUser: uid,
        },
        service: {
          ports: {
            metrics: metricsPort,
          },
        },
      },
    },
  },
  transformations: [],
}, { provider });

const service = Service.get(
  'postgres',
  interpolate`${ns.metadata.name}/${serviceName}`,
  { provider, dependsOn: chart.ready });

export const clusterHostname = interpolate`${service.metadata.name}.${ns.metadata.name}`;
