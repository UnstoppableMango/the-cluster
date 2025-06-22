import { Config } from '@pulumi/pulumi';

export interface Versions {
  gitea: string;
}

const config = new Config();
// export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
export const username = 'gitea_admin';
export const email = config.require('email');
