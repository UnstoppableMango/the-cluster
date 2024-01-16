import { Config, getStack } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
  aliases: {
    external: string[];
    internal: string[];
  };
}

export interface Versions {
  plex: string;
  kubePlex: string;
}

const config = new Config();
export const cluster = getStack();
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
export const claimToken = config.require('claimToken');
