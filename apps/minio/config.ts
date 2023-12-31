import { Config } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
  aliases: {
    external: string[];
    internal: string[];
  };
}

export interface Versions {
  minio: string;
}

const config = new Config();
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
export const releaseName = 'minio';
export const servicePort = 9443;
