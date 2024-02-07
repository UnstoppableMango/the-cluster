import { getStack } from '@pulumi/pulumi';
import * as cluster from '@unstoppablemango/thecluster/cluster';

export const clusterName = 'rosequartz';
export const ref = cluster.ref(clusterName, getStack());
export const provider = cluster.provider(ref, clusterName);
