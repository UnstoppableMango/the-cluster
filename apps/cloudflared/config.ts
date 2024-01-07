import { Config, getStack } from '@pulumi/pulumi';

interface Versions {
  cloudflared: string;
}

export const stack = getStack();
const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const accountId = config.require('accountId');
