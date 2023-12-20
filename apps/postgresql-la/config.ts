import { Config } from '@pulumi/pulumi';

export interface Hosts {
  internal: string;
}

export interface Versions {
  bitnamiPostgresql: string;
  bitnamiExporter: string;
}

const config = new Config();
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');

export const primaryUsername = 'unmango';
export const replicationUsername = 'repl_user';
export const adminPasswordKey = 'admin-password';
export const userPasswordKey = 'user-password';
export const replicationPasswordKey = 'replication-password';
export const primaryDatabase = 'postgres';
export const postgresPort = 5432;
export const registry = 'docker.io';
export const repository = 'bitnami/postgresql';
export const architecture = 'replication';
export const uid = 1001, gid = 1001;
export const exporterRepository = 'bitnami/postgres-exporter';
export const metricsPort = 9187;
export const loadBalancerIP = '192.168.1.83';

export const resources = {
  primary: {
    limits: {
      cpu: '250m',
      memory: '256Mi',
    },
    requests: {
      cpu: '250m',
      memory: '256Mi',
    },
  },
};
