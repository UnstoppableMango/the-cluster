import { Config } from '@pulumi/pulumi';

export interface GitHub {
  clientId: string;
  clientSecret: string;
}

export interface Hosts {
  internal: string;
  external: string;
}

export interface Versions {
  drone: string;
}

const config = new Config();
export const github = config.requireObject<GitHub>('github');
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
export const userFilter = config.requireObject<string[]>('userFilter');
