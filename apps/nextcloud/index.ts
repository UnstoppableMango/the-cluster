import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { interpolate } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';

const ns = new Namespace('nextcloud', {
  metadata: { name: 'nextcloud' },
});


const defaultTeam = new CustomResource('nextcloud', {
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
    teamId: defaultTeam.metadata.name,
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
      keycloak: [],
    },
    allowedSourceRanges: [
      '192.168.1.0/24',
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
      className: 'thecluster.io',
    },
    nextcloud: {
      host: 'nextcloud.thecluster.io',
      // password: password.result,
    },
    resources: {
      requests: {
        cpu: '10m',
        memory: '128Mi',
      },
      limits: {
        cpu: '100m',
        memory: '1Gi',
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
        usernameKey: '',
      },
    },
  },
});

// export const adminPassword = password.result;
