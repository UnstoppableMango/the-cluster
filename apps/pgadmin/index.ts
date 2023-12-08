import * as fs from 'node:fs/promises';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pg from '@pulumi/postgresql';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { cloudflare as cfIngress, internal as internalIngress } from '@unmango/thecluster/ingress-classes';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { provider as piholeProvider } from '@unmango/thecluster/apps/pihole';
import { loadBalancerIp } from '@unmango/thecluster/apps/nginx-ingress';
import { credentials as pgCreds, provider as pgProvider, database, ip, hostname, port } from '@unmango/thecluster/apps/postgresql';
import { external } from '@unmango/thecluster/realms';
import { email, hosts, keepers } from './config';

const ns = new k8s.core.v1.Namespace('pgadmin', {
  metadata: { name: 'pgadmin' },
}, { provider });

const pgadminUsername = 'pgadmin';
const pgadminPassword = new random.RandomPassword('pgadmin', {
  length: 48,
  special: false,
  keepers: {
    // Manual password reset with `./scripts/reset-password.sh`
    manual: keepers.pgadmin,
  },
});

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
    'pgadmin.pgpass': pulumi.interpolate`${hostname}:${port}:${pgadminUsername}:${pgadminPassword.result}`,
  },
}, { provider });

// const ownerRole = new pg.Role('pgadmin_owner', {
//   name: 'pgadmin_owner',
// }, { provider: pgProvider });

// const schema = new pg.Schema('pgadmin', {
//   name: 'pgadmin',
//   database,
//   owner: ownerRole.name,
// }, { provider: pgProvider });

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
            Username: pgCreds.postgres.username,
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
      extraSecretMounts: [{
        name: 'pgpassfile',
        secret: pgadminSecret.metadata.name,
        subPath: 'pgadmin.pgpass',
        mountPath: '/var/lib/pgadmin/storage/pgadmin/pgadmin.pgpass',
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
            // value: pulumi.interpolate`postgresql://${pgCreds.postgres.username}:${pgCreds.postgres.password}@${ip}:${port}/${database}?options=-csearch_path=${schema.name}`,
            value: pulumi.interpolate`postgresql://${pgCreds.postgres.username}:${pgCreds.postgres.password}@${ip}:${port}/${database}`,
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
  pgadmin: { username: pgadminUsername, password: pgadminPassword.result },
};
