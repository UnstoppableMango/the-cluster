import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { interpolate } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';
import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import {
  apps,
  clusterIssuers,
  databases,
  ingresses,
  provider,
  realms,
  shared,
} from '@unstoppablemango/thecluster/cluster/from-stack';
import { redirectUris } from '@unstoppablemango/thecluster/apps/keycloak';
import { concat, join, certificate } from '@unstoppablemango/thecluster/util';
import { client, readersGroup } from './oauth';
import { email, hosts, username, versions } from './config';

const ns = Namespace.get('pgadmin', shared.namespaces.pgadmin, { provider });
const { clusterHostname: dbHost, port: dbPort } = apps.postgresqlLa;
const postgresCertDir = '/etc/ssl/certs';
const pgadminPasswordKey = 'pgadminPassword';
const password = new RandomPassword('pgadmin', { length: 48 });

const secret = new Secret('pgadmin', {
  metadata: {
    name: 'pgadmin',
    namespace: ns.metadata.name,
  },
  stringData: {
    [pgadminPasswordKey]: password.result,
  },
}, { provider });

const config = new ConfigMap('pgadmin', {
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

const env = new ConfigMap('pgadmin-env', {
  metadata: {
    name: 'pgadmin-env',
    namespace: ns.metadata.name,
  },
  data: {
    // https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html
    PGADMIN_DISABLE_POSTFIX: 'true',
    PGADMIN_LISTEN_ADDRESS: '0.0.0.0',
    PGADMIN_LISTEN_PORT: '8080',
    CONFIG_DATABASE_URI: concat([
      interpolate`postgresql://${username}@${dbHost}:${dbPort}/${databases.pgadmin.name}?`,
      join([
        'sslmode=verify-full',
        `sslrootcert=${path.join(postgresCertDir, 'ca.crt')}`,
        `sslcert=${path.join(postgresCertDir, 'tls.crt')}`,
        `sslkey=${path.join(postgresCertDir, 'tls.key')}`,
      ], '&'),
    ]),
    // https://www.pgadmin.org/docs/pgadmin4/latest/oauth2.html
    OAUTH2_CLIENT_ID: client.clientId,
    OAUTH2_CLIENT_SECRET: client.clientSecret,
    OAUTH2_TOKEN_URL: realms.external.tokenUrl,
    OAUTH2_AUTHORIZATION_URL: realms.external.authorizationUrl,
    OAUTH2_API_BASE_URL: realms.external.apiBaseUrl,
    OAUTH2_USERINFO_ENDPOINT: realms.external.userinfoEndpoint,
    OAUTH2_SCOPE: interpolate`openid email ${realms.groupsScopeName}`,
  },
}, { provider });

const releaseName = 'pgadmin';
const chart = new Chart(releaseName, {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // Still some bullshit in here but its mostly there
    // https://github.com/rowanruseler/helm-charts/blob/main/charts/pgadmin4/values.yaml
    pgadmin4: {
      image: {
        registry: 'docker.io',
        repository: 'dpage/pgadmin4',
        tag: versions.pagadmin,
      },
      containerPorts: {
        http: 8080,
      },
      service: {
        type: 'ClusterIP',
        port: 80,
        targetPort: 8080,
      },
      serviceAccount: {
        create: true,
      },
      serverDefinitions: {
        enabled: true,
        resourceType: 'ConfigMap',
        servers: {
          thecluster: {
            Name: databases.pgadmin.name,
            Group: 'THECLUSTER',
            Port: dbPort,
            Username: username,
            Host: dbHost,
            SSLMode: 'require',
            MaintenanceDB: databases.pgadmin.name,
            SSLCert: path.join(postgresCertDir, 'tls.crt'),
            SSLKey: path.join(postgresCertDir, 'tls.key'),
            SSLRootCert: path.join(postgresCertDir, 'ca.crt'),
          },
        },
      },
      ingress: {
        enabled: true,
        annotations: {
          'cert-manager.io/cluster-issuer': clusterIssuers.staging,
        },
        ingressClassName: ingresses.internal,
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
      extraVolumes: [certificate('postgres', {
        issuer: clusterIssuers.postgres,
        issuerKind: 'ClusterIssuer',
        commonName: username,
        fsGroup: 5050, // pgadmin UID
      })],
      extraVolumeMounts: [{
        name: 'postgres',
        mountPath: postgresCertDir,
        readOnly: true,
      }],
      extraConfigmapMounts: [{
        name: 'config',
        configMap: config.metadata.name,
        subPath: 'config_local.py',
        mountPath: '/pgadmin4/config_local.py',
        readOnly: true,
      }],
      existingSecret: secret.metadata.name,
      secretKeys: { pgadminPasswordKey },
      envVarsFromConfigMaps: [env.metadata.name],
      env: { email },
      persistentVolume: { enabled: false },
      containerSecurityContext: { enabled: true },
      VolumePermissions: { enabled: true },
      resources: {
        limits: {
          // Initial startup needs a bit of heft
          // cpu: '300m',
          memory: '512Mi',
        },
        requests: {
          cpu: '50m',
          memory: '128Mi',
        },
      },
      replicas: 1,
      namespace: ns.metadata.name,
    },
    'oauth2-proxy': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://${releaseName}-pgadmin4:80` },
        { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: 'http://0.0.0.0:4180' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: redirectUris(hosts.external) },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: realms.external.issuerUrl },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        { name: 'OAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_ACCESS_TOKEN', value: 'true' },
        { name: 'OAUTH2_PROXY_COOKIE_SECURE', value: 'true' },
        { name: 'OAUTH2_PROXY_REVERSE_PROXY', value: 'true' },
        { name: 'OAUTH2_PROXY_EMAIL_DOMAINS', value: '*' },
        { name: 'OAUTH2_PROXY_SKIP_PROVIDER_BUTTON', value: 'true' },
        { name: 'OAUTH2_PROXY_ALLOWED_GROUPS', value: interpolate`/${readersGroup.name},/WebAppReaders` },
        { name: 'OAUTH2_PROXY_OIDC_GROUPS_CLAIM', value: realms.groupsScopeName },
      ],
      service: {
        type: 'ClusterIP',
      },
      ingress: {
        enabled: true,
        className: ingresses.theclusterIo,
        pathType: 'Prefix',
        hosts: [hosts.external],
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
          'pulumi.com/skipAwait': 'true',
        },
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
  },
}, { provider });

const passwordOutput = password.result;
export { hosts, passwordOutput as password, versions };
