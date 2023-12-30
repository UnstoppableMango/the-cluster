import { Config, getStack } from '@pulumi/pulumi';

export interface Versions {
  nginxIngress: string;
}

const config = new Config();

export const cluster = getStack().split('-')[0];
export const ip = config.require('ip');
export const versions = config.requireObject<Versions>('versions');
export const internalClass = 'nginx';
