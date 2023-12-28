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
  deemix: string;
}

const config = new Config();
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
export const releaseName = 'deemix';
export const servicePort = 6595;

export const resources = {
  limits: {
    cpu: '100m',
    memory: '128Mi',
  },
  requests: {
    cpu: '100m',
    memory: '128Mi',
  },
};
