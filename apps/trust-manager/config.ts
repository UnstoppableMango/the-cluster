import { Config, getStack, output } from '@pulumi/pulumi';

export interface Versions {
  trustManager: string;
}

const config = new Config();
export const suffix = config.get('suffix');
export const cluster = getStack();
export const versions = config.requireObject<Versions>('versions');
