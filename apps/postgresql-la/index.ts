import * as fs from 'node:fs/promises';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { Namespace } from '@pulumi/kubernetes/core/v1';
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
    },
    usages: [
      'server auth',
      'client auth',
    ],
    dnsNames: [
      // hosts.external, // TODO
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
    ],
  },
}, { provider });

const chart = new Chart('postgres', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    postgresql: {
      global: {
        storageClass: storageClasses.rbd,
        postgresql: {
          // The values.yaml mentions this overrides `service.ports.postgresql`
          // but I don't think this chart has a top-level `service` object...
          // They seem to be split into `primary.service` and `read.service`.
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

function password(name: string): random.RandomPassword {
  return new random.RandomPassword(name, {
    length: 48,
    special: false,
  });
}
