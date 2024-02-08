import { Config, StackReference, getStack } from '@pulumi/pulumi';
import * as cluster from '@unstoppablemango/thecluster/cluster';

export interface Cloudflare {
  accountId: string;
  apiToken: string;
  email: string;
  globalApiKey: string;
  zoneId: string;
}

const config = new Config();
export const clusterName = 'rosequartz';
export const ref = cluster.ref(clusterName, getStack());
export const provider = cluster.provider(ref, clusterName);
export const cloudflare = config.requireObject<Cloudflare>('cloudflare');

const caRef = new StackReference('ca', {
  name: `UnstoppableMango/thecluster-ca/${config.require('caStack')}`,
});

export const caPem = caRef.requireOutput('caPem');
