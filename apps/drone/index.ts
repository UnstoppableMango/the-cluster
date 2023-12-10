import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { external } from '@unmango/thecluster/realms';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { provider as piholeProvider } from '@unmango/thecluster/apps/pihole';
import { loadBalancerIp } from '@unmango/thecluster/apps/nginx-ingress';
import { cloudflare as cfIngress, internal as internalIngress } from '@unmango/thecluster/ingress-classes';
import { user as dbUser, database, ip as dbIp, port as dbPort } from '@unmango/thecluster/dbs/drone';
import { dockerHost, github, hosts, userFilter, versions } from './config';

const ns = new k8s.core.v1.Namespace('drone', {
  metadata: { name: 'drone' },
}, { provider });

const rpcToken = new random.RandomId('rpc', {
  byteLength: 16,
});

const encryptionKey = new random.RandomId('encryption', {
  byteLength: 16,
});

const client = new keycloak.openid.Client('drone', {
  realmId: external.realm,
  enabled: true,
  name: 'Drone',
  clientId: 'drone',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    pulumi.interpolate`https://${hosts.external}/oauth2/callback`,
    pulumi.interpolate`https://${hosts.internal}/oauth2/callback`,
  ],
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('drone', {
  realmId: external.realm,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const uiClient = new keycloak.openid.Client('runner-ui', {
  realmId: external.realm,
  enabled: true,
  name: 'Drone Runner UI',
  clientId: 'drone-runner-ui',
  accessType: 'CONFIDENTIAL',
}, { provider: keycloakProvider });

const droneSecret = new k8s.core.v1.Secret('drone-secrets', {
  metadata: {
    name: 'drone-secrets',
    namespace: ns.metadata.name,
  },
  stringData: {
    DRONE_DATABASE_SECRET: encryptionKey.hex,
    DRONE_DATABASE_DATASOURCE: pulumi.interpolate`postgres://${dbUser.username}:${dbUser.password}@${dbIp}:${dbPort}/${database}?sslmode=disable`,
    DRONE_GITHUB_CLIENT_SECRET: github.clientSecret,
    DRONE_RPC_SECRET: rpcToken.hex,
    DRONE_UI_PASSWORD: uiClient.clientSecret,
  },
}, { provider });

const port = 8080;
const chart = new k8s.helm.v3.Chart('drone', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    drone: {
      image: {
        registry: 'docker.io',
        repository: 'drone/drone',
        tag: versions.drone,
      },
      service: {
        // Chart doesn't allow pinning clusterIP
        type: 'ClusterIP',
        port,
      },
      ingress: {
        enabled: true,
        annotations: {
          'cert-manager.io/cluster-issuer': clusterIssuers.staging,
        },
        className: internalIngress,
        hosts: [{
          host: hosts.internal,
          paths: [{
            path: '/',
            pathType: 'ImplementationSpecific',
          }],
        }],
        tls: [{
          secretName: 'drone-tls',
          hosts: [hosts.internal],
        }],
      },
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
      persistentVolume: { enabled: false },
      extraSecretNamesForEnvFrom: [
        droneSecret.metadata.name,
      ],
      env: {
        DRONE_SERVER_HOST: hosts.external,
        DRONE_SERVER_PROTO: 'https',
        DRONE_DATABASE_DRIVER: 'postgres',
        DRONE_GITHUB_CLIENT_ID: github.clientId,
        DRONE_USER_FILTER: userFilter.join(','),
      },
    },
    'oauth2-proxy': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://drone:${port}` },
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
        clusterIP: '10.102.210.76',
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
      resources: {
        limits: {
          cpu: '100m',
          memory: '300Mi',
        },
        requests: {
          cpu: '100m',
          memory: '300Mi',
        },
      },
    },
    'drone-runner-docker': {
      image: {
        registry: 'docker.io',
        repository: 'drone/drone-runner-docker',
        tag: versions.droneRunnerDocker,
      },
      dind: {
        registry: 'docker.io',
        repository: 'docker',
        tag: versions.dind,
        command: ['dockerd'],
        commandArgs: ['--host', dockerHost],
        extraVolumeMounts: [],
        resources: {
          limits: {
            cpu: '100m',
            memory: '128Mi',
          },
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
        },
      },
      gc: {
        enabled: true,
        registry: 'docker.io',
        repository: 'drone/gc',
        tag: versions.droneGc,
        env: {
          GC_DEBUG: 'false',
          GC_DEBUG_COLOR: 'true',
          GC_DEBUG_PRETTY: 'true',
          GC_IGNORE_IMAGES: '',
          GC_IGNORE_CONTAINERS: '',
          GC_INTERVAL: '5m',
          GC_CACHE: '10gb',
        },
        resources: {
          limits: {
            cpu: '100m',
            memory: '128Mi',
          },
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
        },
      },
      service: {
        type: 'ClusterIP',
        port: 80,
      },
      ingress: {
        enabled: true,
        className: cfIngress,
        annotations: {
          'pulumi.com/skipAwait': 'true',
        },
        hosts: [{
          host: 'drone-runner.thecluster.io',
          paths: [{
            path: '/',
            pathType: 'Prefix',
          }],
        }],
      },
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
      autoscaling: {
        enabled: true,
        minReplicas: 3,
      },
      extraSecretNamesForEnvFrom: [
        droneSecret.metadata.name,
      ],
      env: {
        DOCKER_HOST: dockerHost,
        DRONE_RPC_HOST: pulumi.interpolate`drone:${port}`,
        DRONE_RPC_PROTO: 'http',
        DRONE_UI_USERNAME: uiClient.clientId,
      },
    },
  },
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'Service') return;
    if (obj.metadata.name !== 'drone-drone-runner-docker') return;
    // Same service bullshit that Sidero had
    obj.spec.ports[0].targetPort = 'tcp';
  }],
}, { provider });

const dns = new pihole.DnsRecord(hosts.internal, {
  domain: hosts.internal,
  ip: loadBalancerIp,
}, { provider: piholeProvider });

export const clientId = client.clientId;
export const clientSecret = client.clientSecret;
