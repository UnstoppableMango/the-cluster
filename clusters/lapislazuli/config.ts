import { Config, getProject } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
  aliases: {
    external: string[];
    internal: string[];
  };
}

export interface Ports {
  external: number;
}

export interface Versions {
  coreDns: string;
  k0s: string;
  k8s: string;
  vcluster: string;
}

const config = new Config();
export const cluster = getProject().replace('thecluster-', '');
export const hosts = config.requireObject<Hosts>('hosts');
export const ports = config.requireObject<Ports>('ports');
export const versions = config.requireObject<Versions>('versions');
export const ip = config.require('ip');
