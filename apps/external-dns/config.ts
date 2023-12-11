import { Config } from '@pulumi/pulumi';

export interface Versions {
  externalDns: string;
}

export interface ProviderConfig {
  internalDomains: string[];
  externalDomains: string[];
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const piholeConfig = config.requireObject<ProviderConfig>('pihole');
