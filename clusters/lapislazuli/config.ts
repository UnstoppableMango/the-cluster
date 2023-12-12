import { Config, getProject } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
}

export interface Ports {
  external: number;
}

export interface Versions {
  k0s: string;
  k8s: string;
  vcluster: string;
}

const config = new Config();
export const cluster = getProject();
export const hosts = config.requireObject<Hosts>('hosts');
export const ports = config.requireObject<Ports>('ports');
export const versions = config.requireObject<Versions>('versions');
