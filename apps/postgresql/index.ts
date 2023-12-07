import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { Certificate, Issuer, ClusterIssuer } from '@pulumi/crds/certmanager/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { rbdStorageClass } from '@unmango/thecluster/storage';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { required } from '@unmango/thecluster';
import { keepers, username, database, versions } from './config';

const ns = new k8s.core.v1.Namespace('postgresql', {
  metadata: { name: 'postgresql' },
}, { provider });

const tlsSecretName = 'postgres-tls';
const clusterIssuer = ClusterIssuer.get('selfsigned', clusterIssuers.selfSigned);
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
      kind: clusterIssuer.kind.apply(required),
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

const adminPassword = new random.RandomPassword('admin', {
  length: 48,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.admin,
  },
});

const postgresPassword = new random.RandomPassword('postgres', {
  length: 48,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.postgres,
  },
});

const repmgrPassword = new random.RandomPassword('repmgr', {
  length: 48,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.repmgr,
  },
});

const userPassword = new random.RandomPassword('user', {
  length: 48,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.user,
  },
});

const postgresSecret = new k8s.core.v1.Secret('postgres-credentials', {
  metadata: {
    name: 'postgres-credentials',
    namespace: ns.metadata.name,
  },
  stringData: {
    'admin-password': adminPassword.result,
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
    // 'admin-password': adminPassword.result,
    // 'postgres-password': postgresPassword.result,
    password: postgresPassword.result,
    // 'repmgr-password': repmgrPassword.result,
  },
}, { provider });

const customUsersSecret = new k8s.core.v1.Secret('custom-users', {
  metadata: {
    name: 'custom-users',
    namespace: ns.metadata.name,
  },
  // https://github.com/bitnami/charts/blob/c3649df3161b59164c53944058d145084796c666/bitnami/postgresql-ha/values.yaml#L1061-L1070
  stringData: {
    usernames: username,
    passwords: userPassword.result,
  },
}, { provider })

// const primaryPvc = new k8s.core.v1.PersistentVolumeClaim('primary', {
//   metadata: {
//     name: 'primary',
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     storageClassName: rbdStorageClass,
//     accessModes: ['ReadWriteOnce'],
//     resources: {
//       requests: {
//         storage: '250Gi',
//       },
//     },
//   },
// }, { provider });

const chart = new k8s.helm.v3.Chart('postgresql', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/bitnami/charts/blob/main/bitnami/postgresql/values.yaml
    'postgresql-ha': {
      global: {
        storageClass: rbdStorageClass,
        postgresql: {
          username,
          database,
          existingSecret: postgresSecret.metadata.name,
          pgpool: {
            existingSecret: pgpoolSecret.metadata.name,
          },
          // This seems to have dissapeared...
          // secretKeys: {
          //   adminPasswordKey: 'admin',
          //   userPasswordKey: 'user',
          //   replicationPasswordKey: 'replication',
          // },
        },
      },
      kubeVersion: versions.k8s,
      // TODO: See if one of these can make things prettier
      // nameOverride: '',
      // fullnameOverride: '',
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
        // customUsersSecret: customUsersSecret.metadata.name,
        replicaCount: 3,
        priorityClassName: 'system-cluster-critical',
        pdb: {
          create: true,
          minAvailable: 1,
        },
        logConnections: true,
        tls: {
          // Maybe one day when I'm not an idiot
          enabled: false,
        },
      },
      rbac: {
        create: true,
      },
      serviceAccount: {
        create: true,
      },
      metrics: {
        enabled: true,
        image: {
          tag: versions.bitnami.postgresExporter,
        },
        service: {
          // TODO: Probably pin this so its easier to pass around
          // clusterIP: '69.69.69.69',
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
        enabled: false, // I'll probably wanna turn this on
      },
      service: {
        type: 'ClusterIP',
        // TODO: Probably pin this so its easier to pass around
        // clusterIP: '69.69.69.69',
      },
    },
  },
}, { provider });

export const credentials = {
  admin: adminPassword.result,
  user: userPassword.result,
  repmgr: repmgrPassword.result,
  postgres: postgresPassword.result,
};
