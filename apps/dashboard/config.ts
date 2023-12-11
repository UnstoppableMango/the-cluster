import { Config, getStack } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
}

const config = new Config();

export const cluster = getStack();
export const hosts = config.requireObject<Hosts>('hosts');
