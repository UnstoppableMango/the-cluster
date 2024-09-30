import { Config } from '@pulumi/pulumi';

export interface Versions {
  ${PROJECT}: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const clusterName = getStack();
export const ref = cluster.ref(clusterName, 'prod');
export const provider = cluster.provider(ref, clusterName);
