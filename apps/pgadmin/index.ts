import * as fs from 'node:fs/promises';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { cloudflare as cfIngress, internal as internalIngress } from '@unmango/thecluster/ingress-classes';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { provider as piholeProvider } from '@unmango/thecluster/apps/pihole';
import { loadBalancerIp } from '@unmango/thecluster/apps/nginx-ingress';
import { database, ip, hostname, port, users, schema } from '@unmango/thecluster/dbs/postgres';
import { external } from '@unmango/thecluster/realms';
import { join } from '@unmango/thecluster';
import { email, hosts } from './config';
import * as YAML from 'yaml';

const ns = new k8s.core.v1.Namespace('pgadmin', {
  metadata: { name: 'pgadmin' },
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

const user = pulumi.output(users).apply(x => x.find(y => y.username === 'pgadmin'));
const username = user.apply(x => x?.username ?? '');
const password = user.apply(x => x?.password ?? '');
const pgadminSecret = new k8s.core.v1.Secret('pgadmin-credentials', {
  metadata: {
    name: 'pgadmin-credentials',
    namespace: ns.metadata.name,
  },
  stringData: {
    password: user.apply(x => x?.password ?? ''),
    'pgadmin.pgpass': join(pulumi.output(users).apply(x => x.flatMap(user => ([
      pulumi.interpolate`${hostname}:${port}:${user.username}:${user.password}`,
      pulumi.interpolate`${ip}:${port}:${user.username}:${user.password}`,
    ]))), '\n'),
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
            Username: username,
            Host: ip,
            SSLMode: 'disable',
            MaintenanceDB: database, // idfk man, it was `postgres` before
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
      // TODO: Make this better somehow
      extraInitContainers: YAML.stringify([{
        name: 'add-folder-for-pgpass',
        image: 'dpage/pgadmin4:4.23',
        command: ['/bin/mkdir', '-p', '/var/lib/pgadmin/storage/pgadmin'],
        volumeMounts: [{
          name: 'pgadmin-data',
          mountPath: '/var/lib/pgadmin',
        }],
        securityContext: {
          runAsUser: 5050,
        },
      }]),
      VolumePermissions: { enabled: true },
      existingSecret: pgadminSecret.metadata.name,
      secretKeys: {
        pgadminPasswordKey: 'password',
      },
      env: {
        email,
        password: user.apply(x => x?.password),
        pgpassfile: '/var/lib/pgadmin/storage/pgadmin/pgadmin.pgpass',
        variables: [
          {
            name: 'CONFIG_DATABASE_URI',
            // value: pulumi.interpolate`postgresql://${credentials.postgres.username}:${credentials.postgres.password}@${ip}:${port}/${database}?options=-csearch_path=${schema}`,
            // value: pulumi.interpolate`postgresql://${username}@${ip}:${port}?options=-csearch_path=${schema}`,
            value: pulumi.interpolate`postgresql://${username}:${password}@${ip}:${port}/${database}?options=-csearch_path=${schema}`,
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

// export const chartResources = chart.resources;
export { hosts };
