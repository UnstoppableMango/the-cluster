import { Config, getStack } from '@pulumi/pulumi';
import * as cluster from '@unstoppablemango/thecluster/cluster';

export interface Versions {
  externalSnapshotter: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');

export const clusterName = getStack();
export const ref = cluster.ref(clusterName, 'prod');
export const provider = cluster.provider(ref, clusterName);
