import { Config, getStack } from '@pulumi/pulumi';

export interface Backblaze {
  accessKey: string;
  keyName: string;
  bucketName: string;
  applicationKey: string;
}

export interface Versions {
  bitnamiKubectl: string;
  velero: string;
  veleroCsi: string;
  veleroAws: string;
}

const config = new Config();
export const clusterName = getStack();

export const versions = config.requireObject<Versions>('versions');
export const backblaze = config.requireObject<Backblaze>('backblaze');
