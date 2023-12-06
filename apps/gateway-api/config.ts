import { Config } from '@pulumi/pulumi';

export interface Versions {
  gatewayApi: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const channel = config.require('channel');
