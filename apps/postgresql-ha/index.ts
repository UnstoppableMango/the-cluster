import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { Certificate, Issuer } from '@unmango/thecluster-crds/certmanager/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { rbdStorageClass } from '@unmango/thecluster/storage';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { keepers, users as enabledUsers, database, versions, ip, port, hostname } from './config';

const ns = new k8s.core.v1.Namespace('postgresql', {
  metadata: { name: 'postgresql' },
}, { provider });

const tlsSecretName = 'postgres-tls';
const ca = new Certificate('postgres-ca', {
  metadata: {
    name: 'postgres-ca',
    namespace: ns.metadata.name,
  },
  spec: {
    isCA: true,
    commonName: 'unmango-postgres-ca',
    secretName: tlsSecretName,
    privateKey: {
      algorithm: 'ECDSA',
      size: 256,
    },
    issuerRef: {
      group: 'cert-manager.io',
      kind: 'ClusterIssuer',
      name: clusterIssuers.selfSigned,
    },
  },
}, { provider });

const issuer = new Issuer('postgres', {
  metadata: {
    name: 'postgres',
    namespace: ns.metadata.name,
  },
  spec: {
    ca: {
      secretName: tlsSecretName,
    },
  },
}, { provider });

const postgresUsername = 'postgres';
const postgresPassword = new random.RandomPassword('postgres', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.postgres,
  },
});

const repmgrUsername = 'rep_mgr';
const repmgrPassword = new random.RandomPassword('repmgr', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.repmgr,
  },
});

const pgpoolUsername = 'pgpool_admin';
const pgpoolPassword = new random.RandomPassword('pgpool', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.pgpool,
  },
});

const postgresSecret = new k8s.core.v1.Secret('postgres-credentials', {
  metadata: {
    name: 'postgres-credentials',
    namespace: ns.metadata.name,
  },
  stringData: {
    'postgres-password': postgresPassword.result,
    'password': postgresPassword.result,
    'repmgr-password': repmgrPassword.result,
  },
}, { provider });

const pgpoolSecret = new k8s.core.v1.Secret('pgpool-credentials', {
  metadata: {
    name: 'pgpool-credentials',
    namespace: ns.metadata.name,
  },
  stringData: {
    'admin-password': pgpoolPassword.result,
  },
}, { provider });

const passwords = enabledUsers.map(user => ({
  username: pulumi.output(user),
  password: new random.RandomPassword(user, {
    length: 48,
    special: false,
  }).result,
}));

const delimeter = ';';
const customUsersSecret = new k8s.core.v1.Secret('custom-users', {
  metadata: {
    name: 'custom-users',
    namespace: ns.metadata.name,
  },
  // https://github.com/bitnami/charts/blob/c3649df3161b59164c53944058d145084796c666/bitnami/postgresql-ha/values.yaml#L1061-L1070
  stringData: {
    // The order of these two arrays must be the same!
    usernames: pulumi.all([
      postgresUsername,
      repmgrUsername,
      pgpoolUsername,
      ...passwords.map(x => x.username),
    ]).apply(u => u.join(delimeter)),
    passwords: pulumi.all([
      postgresPassword.result,
      repmgrPassword.result,
      pgpoolPassword.result,
      ...passwords.map(x => x.password),
    ]).apply(p => p.join(delimeter)),
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('postgresql', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/bitnami/charts/blob/main/bitnami/postgresql-ha/values.yaml
    'postgresql-ha': {
      global: {
        storageClass: rbdStorageClass,
        postgresql: {
          username: postgresUsername,
          database,
          repmgrUsername: repmgrUsername,
          repmgrDatabase: 'repmgr',
          existingSecret: postgresSecret.metadata.name,
        },
        pgpool: {
          adminUsername: pgpoolUsername,
          existingSecret: pgpoolSecret.metadata.name,
        },
      },
      kubeVersion: versions.k8s,
      postgresql: {
        image: {
          tag: versions.bitnami.postgresqlRepmgr,
        },
        replicaCount: 3,
        priorityClassName: 'system-cluster-critical',
        pdb: {
          create: true,
          minAvailable: 1,
        },
        audit: {
          logConnections: true,
        },
        tls: {
          // Maybe one day when I'm not an idiot
          enabled: false,
        },
      },
      pgpool: {
        image: {
          tag: versions.bitnami.pgpool,
        },
        customUsersSecret: customUsersSecret.metadata.name,
        existingSecretName: pgpoolSecret.metadata.name,
        srCheckDatabase: database,
        replicaCount: 3,
        priorityClassName: 'system-cluster-critical',
        pdb: {
          create: true,
          minAvailable: 1,
        },
        authenticationMethod: 'scram-sha-256',
        logConnections: true,
        useLoadBalancing: true,
        tls: {
          // Maybe one day when I'm not an idiot
          enabled: false,
        },
      },
      rbac: { create: false },
      serviceAccount: { create: true },
      metrics: {
        enabled: true,
        image: {
          tag: versions.bitnami.postgresExporter,
        },
        service: {
          type: 'ClusterIP',
          clusterIP: '10.109.68.63',
        },
        serviceMonitor: {
          // Soon
          enabled: false,
        },
        prometheusRule: {
          // Soon
          enabled: false,
        },
      },
      persistence: {
        enabled: true,
        size: '250Gi',
      },
      persistentVolumeClaimRetentionPolicy: {
        enabled: true,
        whenScaled: 'Retain',
        whenDeleted: 'Retain',
      },
      service: {
        type: 'LoadBalancer',
        loadBalancerIp: ip,
        ports: {
          postgresql: port,
        },
      },
    },
  },
}, { provider });

export { ip, database, port, hostname, passwords };
export const users = {
  repmgr: {
    username: repmgrUsername,
    password: repmgrPassword.result,
  },
  postgres: {
    username: postgresUsername,
    password: postgresPassword.result,
  },
  pgpool: {
    username: pgpoolUsername,
    password: pgpoolPassword.result,
  },
};
