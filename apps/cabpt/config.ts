import { Config, getStack } from '@pulumi/pulumi';

interface Versions {
  uefi: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const stack = getStack();
export const cluster = stack;
