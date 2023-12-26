import * as fs from 'node:fs/promises';
import { interpolate } from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { Namespace, Service } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Certificate } from '@unmango/thecluster-crds/certmanager/v1';
import { clusterIssuers, provider, shared, storageClasses } from '@unmango/thecluster/cluster/from-stack';
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
  replicationPasswordKey,
  replicationUsername,
  repository,
  resources,
  uid,
  versions,
} from './config';

const ns = Namespace.get('postgres', shared.postgresNamespace, { provider });
const adminPassword = password('postgres');
const replicationPassword = password(replicationUsername);
const tlsSecretName = 'postgres-cert';
export { primaryDatabase, hosts, loadBalancerIP as ip, postgresPort as port };

const secret = new k8s.core.v1.Secret('postgres', {
  metadata: {
    name: 'postgres',
    namespace: ns.metadata.name,
  },
  stringData: {
    [adminPasswordKey]: adminPassword.result,
    [replicationPasswordKey]: replicationPassword.result,
  },
}, { provider });

const config = new k8s.core.v1.ConfigMap('postgres', {
  metadata: {
    name: 'postgres',
    namespace: ns.metadata.name,
  },
  data: {
    'pg_hba.conf': fs.readFile('assets/pg_hba.conf', 'utf-8'),
  },
}, { provider });

const releaseName = 'postgres';
const chart = new Chart(releaseName, {
  path: './',
  namespace: ns.metadata.name,
  values: {
    postgresql: {
      global: {
        storageClass: storageClasses.rbd,
        postgresql: {
          // An imaginary top-level service exists
          // that configures both primary and read
          service: {
            ports: {
              postgresql: postgresPort,
            },
          },
        },
      },
      image: {
        registry,
        repository,
        tag: versions.bitnamiPostgresql,
      },
      auth: {
        database: primaryDatabase,
        replicationUsername,
        existingSecret: secret.metadata.name,
        secretKeys: {
          adminPasswordKey,
          replicationPasswordKey,
        },
      },
      architecture,
      replication: {
        applicationName: 'thecluster',
      },
      tls: {
        enabled: true,
        certificatesSecret: tlsSecretName,
        certFilename: 'tls.crt',
        certKeyFilename: 'tls.key',
        certCAFilename: 'ca.crt',
      },
      primary: {
        // When this is supplied, whatever creates the replication user never runs and everything breaks
        // existingConfigmap: config.metadata.name,
        // initdb: {
        //   scripts: {
        //     'create_repl_user.sh': fs.readFile('assets/create_repl_user.sh', 'utf-8'),
        //   },
        // },
        resources,
        podSecurityContext: {
          fsGroup: gid,
        },
        containerSecurityContext: {
          runAsUser: uid,
          // runAsGroup: gid,
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
        },
        persistentVolumeClaimRetentionPolicy: {
          enabled: false,
          whenScaled: 'Retain',
          whenDeleted: 'Retain',
        },
      },
      readReplicas: {
        replicaCount: 4,
        resources,
        podSecurityContext: {
          fsGroup: gid,
        },
        containerSecurityContext: {
          runAsUser: uid,
          // runAsGroup: gid,
        },
        service: {
          type: 'ClusterIP',
        },
        persistence: {
          size: '100Gi',
        },
      },
      // Everything blows up with operation not permitted
      // volumePermissions: {
      //   enabled: true,
      //   image: {
      //     registry,
      //     repository: osShellRepository,
      //     tag: versions.bitnamiOsShell,
      //   },
      //   resources: {
      //     limits: {
      //       cpu: '10m',
      //       memory: '64Mi',
      //     },
      //     requests: {
      //       cpu: '10m',
      //       memory: '64Mi',
      //     },
      //   },
      //   containerSecurityContext: {
      //     runAsUser: uid,
      //     // runAsGroup: gid,
      //   },
      // },
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

const serviceName = interpolate`${releaseName}-postgresql-primary-hl`;
const service = Service.get(
  'postgres',
  interpolate`${ns.metadata.name}/${serviceName}`,
  { provider, dependsOn: chart.ready });

export const clusterHostname = interpolate`${service.metadata.name}.${ns.metadata.name}`;

function password(name: string): random.RandomPassword {
  return new random.RandomPassword(name, {
    length: 48,
    special: false,
  });
}
