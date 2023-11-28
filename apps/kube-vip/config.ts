import { Config } from '@pulumi/pulumi';

export interface Versions {
  'kube-vip': string;
}

const config = new Config();

export const versions = config.requireObject<Versions>('versions');
