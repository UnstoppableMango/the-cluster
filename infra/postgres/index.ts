import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { Namespace } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('postgres-system', {
  metadata: { name: 'postgres-system' },
});

const defaultTeam = new CustomResource('default', {
  apiVersion: 'acid.zalan.do/v1',
  kind: 'PostgresTeam',
  metadata: { namespace: ns.metadata.name },
  spec: {},
});

const cluster = new CustomResource('cluster', {
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
      pulumi: [
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
