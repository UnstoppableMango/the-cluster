import { Config } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
}

const config = new Config();
export const hosts = config.requireObject<Hosts>('hosts');
export const email = config.requireSecret('email');
