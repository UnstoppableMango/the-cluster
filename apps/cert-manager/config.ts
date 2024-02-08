import { Config, getStack } from '@pulumi/pulumi';
import * as cluster from '@unstoppablemango/thecluster/cluster';

const config = new Config();
export const clusterName = 'rosequartz';
export const ref = cluster.ref(clusterName, getStack());
export const provider = cluster.provider(ref, clusterName);
