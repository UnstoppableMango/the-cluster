import { Config } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
}

export interface Versions {
  pagadmin: string,
}

const config = new Config();
export const hosts = config.requireObject<Hosts>('hosts');
export const email = config.requireSecret('email');
export const username = 'pgadmin';
export const versions = config.requireObject<Versions>('versions');
