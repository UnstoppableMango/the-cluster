import * as fs from 'node:fs/promises';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { apps, clusterIssuers, databases, ingresses, provider, realms } from '@unmango/thecluster/cluster/from-stack';
import { dockerHost, github, hosts, repoFilter, runnerRepos, seedUser, userFilter, versions } from './config';

const ns = new k8s.core.v1.Namespace('drone', {
  metadata: { name: 'drone' },
}, { provider });

const rpcToken = new random.RandomId('rpc', {
  byteLength: 16,
});

const encryptionKey = new random.RandomId('encryption', {
  byteLength: 16,
});

const pluginKey = new random.RandomId('plugin', {
  byteLength: 16,
});

const seedToken = new random.RandomId('seed', {
  byteLength: 16,
});

const client = new keycloak.openid.Client('drone', {
  realmId: realms.external.id,
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
}, { provider: apps.keycloak.provider });

const mapper = new keycloak.openid.AudienceProtocolMapper('drone', {
  realmId: realms.external.id,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: apps.keycloak.provider });

const uiClient = new keycloak.openid.Client('runner-ui', {
  realmId: realms.external.id,
  enabled: true,
  name: 'Drone Runner UI',
  clientId: 'drone-runner-ui',
  accessType: 'CONFIDENTIAL',
}, { provider: apps.keycloak.provider });

const droneSecret = new k8s.core.v1.Secret('drone-secrets', {
  metadata: {
    name: 'drone-secrets',
    namespace: ns.metadata.name,
  },
  stringData: {
    DRONE_DATABASE_SECRET: encryptionKey.hex,
    DRONE_DATABASE_DATASOURCE: pulumi.interpolate`postgres://${databases.drone.username}:${databases.drone.password}@${apps.postgresql.ip}:${apps.postgresql.port}/${databases.drone.name}?sslmode=disable`,
    DRONE_GITHUB_CLIENT_SECRET: github.clientSecret,
    DRONE_RPC_SECRET: rpcToken.hex,
    DRONE_UI_PASSWORD: uiClient.clientSecret,
    DRONE_YAML_SECRET: pluginKey.hex,
  },
}, { provider });

const pluginSecret = new k8s.core.v1.Secret('plugin-secrets', {
  metadata: {
    name: 'plugin-secrets',
    namespace: ns.metadata.name,
  },
  stringData: {
    PLUGIN_SECRET: pluginKey.hex,
    GITHUB_TOKEN: github.token,
  },
}, { provider });

const droneTreeConfig = new k8s.core.v1.ConfigMap('drone-tree-config', {
  metadata: {
    name: 'drone-tree-config',
    namespace: ns.metadata.name,
  },
  data: {
    matchfile: fs.readFile('plugins/drone-tree-config/matchfile', 'utf-8'),
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
          'cert-manager.io/cluster-issuer': clusterIssuers.prod,
        },
        className: ingresses.internal,
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
      extraVolumes: [{
        name: 'drone-tree-config',
        configMap: {
          name: droneTreeConfig.metadata.name,
        },
      }],
      extraContainers: [{
        name: 'drone-tree-config',
        image: 'bitsbeats/drone-tree-config',
        // https://github.com/bitsbeats/drone-tree-config#environment-variables
        env: [
          { name: 'PLUGIN_DEBUG', value: 'true' },
          { name: 'PLUGIN_CONCAT', value: 'true' },
          { name: 'PLUGIN_FALLBACK', value: 'true' },
          { name: 'PLUGIN_MAXDEPTH', value: '5' },
          { name: 'PLUGIN_ALWAYS_RUN_ALL', value: 'false' },
          { name: 'PLUGIN_ADDRESS', value: ':3000' },
          { name: 'PLUGIN_ALLOW_LIST_FILE', value: '/drone-tree-config-matchfile' },
          { name: 'PLUGIN_CONSIDER_FILE', value: '.drone-consider' },
          { name: 'PLUGIN_CACHE_TTL', value: '30m' },
        ],
        envFrom: [{
          secretRef: {
            name: pluginSecret.metadata.name,
          },
        }],
        volumeMounts: [{
          name: 'drone-tree-config',
          subPath: 'matchfile',
          mountPath: '/drone-tree-config-matchfile',
          readOnly: true,
        }],
      }],
      persistentVolume: { enabled: false },
      extraSecretNamesForEnvFrom: [
        droneSecret.metadata.name,
      ],
      env: {
        // https://docs.drone.io/server/reference/
        DRONE_SERVER_HOST: hosts.external,
        DRONE_SERVER_PROTO: 'https',
        DRONE_DATABASE_DRIVER: 'postgres',
        DRONE_GITHUB_CLIENT_ID: github.clientId,
        DRONE_GIT_ALWAYS_AUTH: 'true',
        DRONE_LOGS_COLOR: 'true',
        DRONE_LOGS_DEBUG: 'true',
        DRONE_LOGS_PRETTY: 'true',
        DRONE_USER_FILTER: userFilter.join(','),
        DRONE_REPOSITORY_FILTER: repoFilter.join(','),
        // https://docs.drone.io/server/reference/drone-registration-closed/
        // https://docs.drone.io/server/user/management/
        DRONE_REGISTRATION_CLOSED: 'true',
        DRONE_STARLARK_ENABLED: 'true',
        DRONE_USER_CREATE: pulumi.interpolate`username:${seedUser},machine:false,admin:true,token:${seedToken.hex}`,
        DRONE_STATUS_DISABLED: 'false',
        DRONE_STATUS_NAME: 'continuous-integration/drone',
        DRONE_YAML_ENDPOINT: 'http://localhost:3000',
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
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: realms.external.issuerUrl },
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
        className: ingresses.cloudflare,
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
        commandArgs: ['--host', 'tcp://127.0.0.1:2375'],
        securityContext: {
          privileged: true,
        },
        // extraVolumeMounts: [],
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
        securityContext: {
          capabilities: { drop: ['ALL'] },
          readOnlyRootFilesystem: true,
          runAsNonRoot: true,
          runAsUser: 1000,
        },
        env: {
          GC_DEBUG: 'true',
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
      securityContext: {
        capabilities: { drop: ['ALL'] },
        readOnlyRootFilesystem: true,
        runAsNonRoot: true,
        runAsUser: 1000,
      },
      service: {
        type: 'ClusterIP',
        port: 80,
      },
      ingress: {
        enabled: true,
        className: ingresses.cloudflare,
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
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
        minReplicas: 4,
      },
      extraSecretNamesForEnvFrom: [
        droneSecret.metadata.name,
      ],
      env: {
        // https://docs.drone.io/runner/docker/configuration/reference/
        DRONE_DEBUG: 'true',
        DOCKER_HOST: dockerHost,
        DRONE_RPC_HOST: pulumi.interpolate`drone:${port}`,
        DRONE_RPC_PROTO: 'http',
        DRONE_LIMIT_REPOS: runnerRepos.join(','),
        DRONE_LIMIT_TRUSTED: 'true',
        DRONE_UI_USERNAME: uiClient.clientId,
        // DRONE_RUNNER_VOLUMES: '', // TODO: Something for caching probably
        // DRONE_RUNNER_ENVIRON: '', // TODO: Useful for paths or something probably
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

export const clientId = client.clientId;
export const clientSecret = client.clientSecret;
export const uiUsername = uiClient.clientId;
export const uiPassword = uiClient.clientSecret;
export const seedUserToken = seedToken.hex;
