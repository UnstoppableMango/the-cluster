import { Config, getStack } from '@pulumi/pulumi';

interface Versions {
  docker: string;
}

const config = new Config();
export const cluster = getStack();
export const ip = config.require('ip');
export const versions = config.requireObject<Versions>('versions');
export const hostname = config.require('hostname');
