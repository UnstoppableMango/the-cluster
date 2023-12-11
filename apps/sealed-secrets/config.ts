import { Config } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
}

export interface Versions {
  sealedSecrets: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const hosts = config.requireObject<Hosts>('hosts');
