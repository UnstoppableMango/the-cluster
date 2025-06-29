import { Config, getStack, StackReference } from '@pulumi/pulumi';
import * as cluster from '@unstoppablemango/thecluster/cluster';

export interface Cloudflare {
	accountId: string;
	apiToken: string;
	email: string;
	globalApiKey: string;
	zoneId: string;
}

export interface Tunnel {
	name: string;
	domain: string;
	size: number;
}

export interface Versions {
	cloudflared: string;
}

const config = new Config();
export const clusterName = getStack();
export const ref = cluster.ref(clusterName, 'prod');
export const provider = cluster.provider(ref, clusterName);
export const cloudflare = config.requireObject<Cloudflare>('cloudflare');
export const tunnels = config.requireObject<Tunnel[]>('tunnels');
export const versions = config.requireObject<Versions>('versions');

const caRef = new StackReference('ca', {
	name: `UnstoppableMango/thecluster-ca/${config.require('caStack')}`,
});

export const caPem = caRef.requireOutput('caPem');

const operatorRef = new StackReference('operator-ref', {
	name: `UnstoppableMango/thecluster-cloudflare-operator/${config.require('operatorStack')}`,
});

export const operatorNamespace = operatorRef.requireOutput('namespace');
export const apiSecretsName = operatorRef.requireOutput('apiSecretsName');
