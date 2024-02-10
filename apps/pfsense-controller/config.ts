import { Config } from '@pulumi/pulumi';
import * as cluster from '@unstoppablemango/thecluster/cluster';

export interface Versions {
  controller: string;
}

const config = new Config();
export const clusterName = 'rosequartz';
export const ref = cluster.ref(clusterName, 'prod');
export const provider = cluster.provider(ref, clusterName);
export const username = config.require('username');
export const password = config.require('password');
export const versions = config.requireObject<Versions>('versions');
