import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { interpolate } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';

const ns = new Namespace('nextcloud', {
  metadata: { name: 'nextcloud' },
});


const team = new CustomResource('nextcloud', {
  apiVersion: 'acid.zalan.do/v1',
  kind: 'PostgresTeam',
  metadata: { namespace: ns.metadata.name },
  spec: {},
});

const cluster = new CustomResource('database', {
  apiVersion: 'acid.zalan.do/v1',
  kind: 'postgresql',
  metadata: { namespace: ns.metadata.name },
  spec: {
    teamId: team.metadata.name,
    volume: {
      size: '50Gi',
      storageClass: 'unsafe-rbd',
    },
    numberOfInstances: 2,
    users: {
      admin: [
        'superuser',
        'createdb',
      ],
      nextcloud: [
        'superuser',
        'createdb',
      ],
    },
    allowedSourceRanges: [
      '192.168.1.0/24',
      '10.43.0.0/16', // Service CIDR(?)
      '10.42.0.0/16', // Pod CIDR(?)
    ],
    databases: {
      keycloak: 'keycloak',
    },
    preparedDatabases: {
      sandbox: {},
    },
    postgresql: {
      version: '17',
    },
    resources: {
      requests: {
        cpu: '10m',
        memory: '100Mi',
      },
      limits: {
        cpu: '500m',
        memory: '500Mi',
      },
    },
  },
});

const secretDomain = 'credentials.postgresql.acid.zalan.do';
const dbSecretName = interpolate`nextcloud.${cluster.metadata.name}.${secretDomain}`;

const password = new RandomPassword('admin', {
  length: 24,
});

const chart = new Chart('nextcloud', {
  namespace: ns.metadata.name,
  chart: 'nextcloud',
  repositoryOpts: {
    repo: 'https://nextcloud.github.io/helm',
  },
  values: {
    ingress: {
      enabled: true,
      className: 'thecluster-io',
      annotations: {
        'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
        'pulumi.com/skipAwait': 'true',
      },
    },
    nextcloud: {
      host: 'nextcloud.thecluster.io',
      password: password.result,
    },
    resources: {
      requests: {
        cpu: '100m',
        memory: '128Mi',
      },
      limits: {
        cpu: '1',
        memory: '512Mi',
      },
    },
    rbac: { enabled: true },
    hpa: { enabled: true },
    internalDatabase: { enabled: false },
    externalDatabase: {
      enabled: true,
      type: 'postgresql',
      host: interpolate`${cluster.metadata.name}:5432`,
      existingSecret: {
        enabled: true,
        secretName: dbSecretName,
        usernameKey: 'username',
        passwordKey: 'password',
      },
    },
    persistance: {
      enabled: true,
      accessMode: 'ReadWriteMany',
      storageClass: 'default-cephfs',
      size: '500Gi',
    },
  },
});

export const adminPassword = password.result;
