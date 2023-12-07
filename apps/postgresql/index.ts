import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pihole from '@unmango/pulumi-pihole';
import { Certificate, Issuer } from '@pulumi/crds/certmanager/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { rbdStorageClass } from '@unmango/thecluster/storage';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { external, externalIssuerUrl } from '@unmango/thecluster/realms';
import { cloudflare as cfIngress, internal as internalIngress } from '@unmango/thecluster/ingress-classes';
import { loadBalancerIp } from '@unmango/thecluster/apps/nginx-ingress';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { provider as piholeProvider } from '@unmango/thecluster/apps/pihole';
import { keepers, username, database, versions, email, hosts } from './config';

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

const adminPassword = new random.RandomPassword('admin', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.admin,
  },
});

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

const userPassword = new random.RandomPassword('user', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.user,
  },
});

const pgadminUsername = 'admin';
const pgadminPassword = new random.RandomPassword('pgadmin', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.pgadmin,
  },
});

const pulumiUsername = 'pulumi';
const pulumiPassword = new random.RandomPassword('pulumi', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.pulumi,
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
    'admin-password': pgpoolPassword.result,
  },
}, { provider });

const customUsersSecret = new k8s.core.v1.Secret('custom-users', {
  metadata: {
    name: 'custom-users',
    namespace: ns.metadata.name,
  },
  // https://github.com/bitnami/charts/blob/c3649df3161b59164c53944058d145084796c666/bitnami/postgresql-ha/values.yaml#L1061-L1070
  stringData: {
    // The order of these two arrays must be the same!
    usernames: [
      postgresUsername,
      username,
      repmgrUsername,
      pgpoolUsername,
      pgadminUsername,
      pulumiUsername,
    ].join(','),
    passwords: pulumi.all([
      postgresPassword.result,
      userPassword.result,
      repmgrPassword.result,
      pgpoolPassword.result,
      pgadminPassword.result,
      pulumiPassword.result,
    ]).apply(p => p.join(',')),
  },
}, { provider });

const client = new keycloak.openid.Client('pgadmin', {
  realmId: external,
  enabled: true,
  name: 'pgAdmin4',
  clientId: 'pgadmin4',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    pulumi.interpolate`https://${hosts.external}/oauth2/callback`,
  ],
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('pgadmin', {
  realmId: external,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const pgadminSecret = new k8s.core.v1.Secret('pgadmin-credentials', {
  metadata: {
    name: 'pgadmin-credentials',
    namespace: ns.metadata.name,
  },
  stringData: {
    password: pgadminPassword.result,
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
          username,
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
        // This keeps breaking things jfc
        // customUsersSecret: customUsersSecret.metadata.name,
        existingSecretName: pgpoolSecret.metadata.name,
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
    pgadmin4: {
      service: {
        type: 'ClusterIP',
      },
      serviceAccount: {
        create: true,
      },
      strategy: {
        // To prevent multi-attach issues with the PVC
        type: 'Recreate',
      },
      serverDefinitions: {
        enabled: true,
        resourceType: 'ConfigMap',
        servers: {
          thecluster: {
            Name: database,
            Group: 'UnMango',
            Port: 5432,
            Username: postgresUsername,
            Host: 'localhost',
            SSLMode: 'prefer',
            MaintenanceDB: 'postgres',
          },
        },
      },
      ingress: {
        enabled: true,
        annotations: {
          'cert-manager.io/cluster-issuer': clusterIssuers.staging,
        },
        ingressClassName: internalIngress,
        hosts: [{
          host: hosts.internal,
          paths: [{
            path: '/',
            pathType: 'Prefix',
          }],
        }],
        tls: [{
          secretName: 'pgadmin-tls',
          hosts: [hosts.internal],
        }],
      },
      existingSecret: pgadminSecret.metadata.name,
      secretKeys: {
        pgadminPasswordKey: 'password',
      },
      env: {
        email,
        password: pgadminPassword.result,
      },
      persistentVolume: {
        enabled: true,
        size: '10Gi',
        storageClass: rbdStorageClass,
      },
      containerPorts: {
        http: 3000,
      },
      autoscaling: {
        enabled: true,
        minReplicas: 1,
      },
      namespace: ns.metadata.name,
    },
    'oauth2-proxy': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://127.0.0.1:3000` },
        { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: 'http://0.0.0.0:4180' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://${hosts.external}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: externalIssuerUrl },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        { name: 'OAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_ACCESS_TOKEN', value: 'true' },
        { name: 'OAUTH2_PROXY_COOKIE_SECURE', value: 'true' },
        { name: 'OAUTH2_PROXY_REVERSE_PROXY', value: 'true' },
        { name: 'OAUTH2_PROXY_EMAIL_DOMAINS', value: '*' },
      ],
      ingress: {
        enabled: true,
        className: cfIngress,
        pathType: 'Prefix',
        hosts: [hosts.external],
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
          'cloudflare-tunnel-ingress-controller.strrl.dev/ssl-verify': 'false',
          'pulumi.com/skipAwait': 'true',
        },
      },
    },
  },
}, { provider });

const internalDnsRecord = new pihole.DnsRecord('internal-pgadmin', {
  domain: hosts.internal,
  ip: loadBalancerIp,
}, { provider: piholeProvider });

export const chartResources = chart.resources;
export const credentials = {
  admin: adminPassword.result,
  user: userPassword.result,
  repmgr: repmgrPassword.result,
  postgres: postgresPassword.result,
  pgpool: pgpoolPassword.result,
  pgadmin: pgadminPassword.result,
  pulumi: {
    username: pulumiUsername,
    password: pulumiPassword.result,
  },
};
