import { Config } from '@pulumi/pulumi';
import { getZonesOutput } from '@pulumi/cloudflare';

export interface LanDomain {
  name: string;
  ip: string;
}

const config = new Config();
export const suffix = config.get('suffix');
export const piholeStack = config.require('piholeStack');
export const fullSslHosts = config.requireObject<string[]>('fullSslHosts');
export const lanDomains = config.requireObject<LanDomain[]>('lanDomains');

export const zone = getZonesOutput({
  filter: {
    accountId: config.require('accountId'),
    name: 'thecluster.io',
  },
}).apply(z => z.zones[0]);
