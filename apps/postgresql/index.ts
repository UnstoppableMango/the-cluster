import * as fs from 'fs/promises';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pihole from '@unmango/pulumi-pihole';
import { Certificate, Issuer } from '@pulumi/crds/certmanager/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { rbdStorageClass } from '@unmango/thecluster/storage';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { external } from '@unmango/thecluster/realms';
import { cloudflare as cfIngress, internal as internalIngress } from '@unmango/thecluster/ingress-classes';
import { loadBalancerIp } from '@unmango/thecluster/apps/nginx-ingress';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { provider as piholeProvider } from '@unmango/thecluster/apps/pihole';
import { keepers, username, database, versions, email, hosts, ip, port } from './config';

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

const userPassword = new random.RandomPassword('user', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.user,
  },
});

const pgadminUsername = 'pgadmin';
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

const delimeter = ';';
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
    ].join(delimeter),
    passwords: pulumi.all([
      postgresPassword.result,
      userPassword.result,
      repmgrPassword.result,
      pgpoolPassword.result,
      pgadminPassword.result,
      pulumiPassword.result,
    ]).apply(p => p.join(delimeter)),
  },
}, { provider });

const client = new keycloak.openid.Client('pgadmin', {
  realmId: external.realm,
  enabled: true,
  name: 'pgAdmin4',
  clientId: 'pgadmin4',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    // oauth2-proxy
    pulumi.interpolate`https://${hosts.external}/oauth2/callback`,
    pulumi.interpolate`https://${hosts.internal}/oauth2/callback`,
    // pgadmin4
    pulumi.interpolate`https://${hosts.external}/oauth2/authorize`,
    pulumi.interpolate`https://${hosts.internal}/oauth2/authorize`,
  ],
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('pgadmin', {
  realmId: external.realm,
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

const pgadminConfig = new k8s.core.v1.ConfigMap('pgadmin', {
  metadata: {
    name: 'pgadmin',
    namespace: ns.metadata.name,
  },
  data: {
    'config_distro.py': fs.readFile('config/config_distro.py', 'utf-8'),
    'config_local.py': fs.readFile('config/config_local.py', 'utf-8'),
    'config_system.py': fs.readFile('config/config_system.py', 'utf-8'),
    'config.py': fs.readFile('config/config.py', 'utf-8'),
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
    // Still some bullshit in here but its mostly there
    // https://github.com/rowanruseler/helm-charts/blob/main/charts/pgadmin4/values.yaml
    pgadmin4: {
      service: {
        type: 'ClusterIP',
        clusterIP: '10.104.137.241',
      },
      serviceAccount: {
        create: true,
      },
      serverDefinitions: {
        enabled: true,
        resourceType: 'ConfigMap',
        servers: {
          thecluster: {
            Name: database,
            Port: port,
            Username: postgresUsername,
            Host: ip,
            SSLMode: 'prefer',
            MaintenanceDB: 'postgres',
          },
        },
      },
      ingress: {
        enabled: true,
        annotations: {
          'cert-manager.io/cluster-issuer': clusterIssuers.prod,
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
      extraConfigmapMounts: [{
        name: 'config',
        configMap: pgadminConfig.metadata.name,
        subPath: 'config_local.py',
        mountPath: '/pgadmin4/config_local.py',
        readOnly: true,
      }],
      existingSecret: pgadminSecret.metadata.name,
      secretKeys: {
        pgadminPasswordKey: 'password',
      },
      env: {
        email,
        password: pgadminPassword.result,
        variables: [
          {
            name: 'CONFIG_DATABASE_URI',
            value: pulumi.interpolate`postgresql://${postgresUsername}:${postgresPassword.result}@${ip}:${port}/${database}`,
          },
          // Currently technically unused
          // Eventually...
          // https://www.pgadmin.org/docs/pgadmin4/latest/oauth2.html
          { name: 'OAUTH2_CLIENT_ID', value: client.clientId },
          { name: 'OAUTH2_CLIENT_SECRET', value: client.clientSecret },
          { name: 'OAUTH2_TOKEN_URL', value: external.tokenUrl },
          { name: 'OAUTH2_AUTHORIZATION_URL', value: external.authorizationUrl },
          { name: 'OAUTH2_API_BASE_URL', value: external.apiBaseUrl },
          // { name: 'OAUTH2_USERINFO_ENDPOINT', value: external.userinfoEndpoint },
          // { name: 'OAUTH2_USERINFO_ENDPOINT', value: 'userinfo' },
        ],
      },
      persistentVolume: { enabled: false },
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
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://postgresql-pgadmin4:80` },
        { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: 'http://0.0.0.0:4180' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://${hosts.external}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: external.issuerUrl },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        { name: 'OAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_ACCESS_TOKEN', value: 'true' },
        { name: 'OAUTH2_PROXY_COOKIE_SECURE', value: 'true' },
        { name: 'OAUTH2_PROXY_REVERSE_PROXY', value: 'true' },
        { name: 'OAUTH2_PROXY_EMAIL_DOMAINS', value: '*' },
        { name: 'OAUTH2_PROXY_SKIP_PROVIDER_BUTTON', value: 'true' },
      ],
      service: {
        type: 'ClusterIP',
        clusterIP: '10.97.27.200',
      },
      ingress: {
        enabled: true,
        className: cfIngress,
        pathType: 'Prefix',
        hosts: [hosts.external],
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
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
  user: { username, password: userPassword.result },
  repmgr: { username: repmgrUsername, password: repmgrPassword.result },
  postgres: { username: postgresUsername, password: postgresPassword.result },
  pgpool: { username: pgpoolUsername, password: pgpoolPassword.result },
  pgadmin: { username: pgadminUsername, password: pgadminPassword.result },
  pulumi: { username: pulumiUsername, password: pulumiPassword.result },
};
