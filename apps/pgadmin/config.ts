import { Config } from '@pulumi/pulumi';

export interface Hosts {
  external: string;
  internal: string;
}

export interface Keepers {
  pgadmin: string;
}

const config = new Config();
export const keepers = config.requireObject<Keepers>('keepers');
export const hosts = config.requireObject<Hosts>('hosts');
export const email = config.requireSecret('email');
