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
  filebrowser: string;
}

const config = new Config();
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
export const releaseName = 'filebrowser';
export const mediaVolumes = ['movies', 'tv', 'anime', 'movies4k', 'tv4k'];
export const servicePort = 8080;

export const resources = {
  limits: {
    cpu: '10m',
    memory: '64Mi',
  },
  requests: {
    cpu: '10m',
    memory: '64Mi',
  },
};
