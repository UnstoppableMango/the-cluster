import { Config } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
}

export interface Keepers {
  admin: string;
  user: string;
  replication: string;
  repmgr: string;
  postgres: string;
  pgadmin: string;
  pgpool: string;
  pulumi: string;
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
export const username = config.require('username');
export const database = config.require('database');
export const versions = config.requireObject<Versions>('versions');
export const email = config.requireSecret('email');
export const hosts = config.requireObject<Hosts>('hosts');
export const ip = '192.168.1.82'; // Meh
export const port = 5432; // Meh also
