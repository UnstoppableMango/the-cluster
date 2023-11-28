import { Config, getStack } from '@pulumi/pulumi';

export interface Versions {
  nginxIngress: string;
}

const config = new Config();

export const cluster = getStack().split('-')[0];
export const versions = config.requireObject<Versions>('versions');
