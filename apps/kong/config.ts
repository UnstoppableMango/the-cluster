import { Config } from '@pulumi/pulumi';

export interface Hostnames {
  proxy: string;
  udpProxy: string;
  admin: string;
  manager: string;
  portal: string;
  portalapi: string;
  status: string;
}

export interface Versions {
  gatewayOperator: string;
}

const config = new Config();
export const hostnames = config.requireObject<Hostnames>('hostnames');
export const versions = config.requireObject<Versions>('versions');
