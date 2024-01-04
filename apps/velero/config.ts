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
export const cluster = getStack();

export const versions = config.requireObject<Versions>('versions');
export const backblaze = config.requireObject<Backblaze>('backblaze');

const minioConfig = new Config('minio');
export const minioAccessKey = minioConfig.require('minioAccessKey');
export const minioSecretKey = minioConfig.require('minioSecretKey');
