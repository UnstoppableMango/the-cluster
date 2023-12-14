import { Config } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
}

export interface Keepers {
  repmgr: string;
  postgres: string;
  pgpool: string;
}

export interface Versions {
  k8s: string;
  bitnami: {
    postgres: string;
    postgresExporter: string;
    postgresqlRepmgr: string;
    pgpool: string;
  };
}

const config = new Config();
export const keepers = config.requireObject<Keepers>('keepers');
export const users = config.requireObject<string[]>('users');
export const database = config.require('database');
export const versions = config.requireObject<Versions>('versions');
export const ip = config.require('ip');
export const port = config.requireNumber('port');
export const hostname = config.require('hostname');
