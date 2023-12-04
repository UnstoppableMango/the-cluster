import { Config, getStack } from '@pulumi/pulumi';

interface Versions {
  dex: string;
}

export const cluster = getStack();
const config = new Config();
export const publicHost = config.require('publicHost');
export const internalHost = config.require('internalHost');
export const versions = config.requireObject<Versions>('versions');
