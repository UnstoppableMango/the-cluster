import { Config } from '@pulumi/pulumi';
import * as cluster from '@unstoppablemango/thecluster/cluster';

export interface Versions {
}

const config = new Config();
export const versions = config.getObject<Versions>('versions');

export const clusterName = 'rosequartz';
export const ref = cluster.ref(clusterName, getStack());
export const provider = cluster.provider(ref, clusterName);
export const cloudflare = config.requireObject<Cloudflare>('cloudflare');
