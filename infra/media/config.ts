import { Config } from '@pulumi/pulumi';

export interface Hosts {
  internal: string;
}

const config = new Config();
export const hosts = config.requireObject<Hosts>('hosts');
