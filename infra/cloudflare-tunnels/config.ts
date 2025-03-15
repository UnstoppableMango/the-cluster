import { Config, StackReference, getStack } from '@pulumi/pulumi';

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
