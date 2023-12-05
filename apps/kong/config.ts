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

const config = new Config();
export const hostnames = config.requireObject<Hostnames>('hostnames');
