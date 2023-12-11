import { Config, getStack } from '@pulumi/pulumi';

export interface Auth {
  adminUser: string;
}

export interface Hosts {
  external: string;
  internal: string;
}

export interface Postgres {
  username: string;
}

export interface GitHub {
  clientId: string;
  clientSecret: string;
}

export interface Google {
  clientId: string;
  clientSecret: string;
}

export interface Versions {
  keycloak: string;
}

const config = new Config();
export const cluster = getStack();

export const auth = config.requireObject<Auth>('auth');
export const production = config.requireBoolean('production');
export const github = config.requireObject<GitHub>('github');
export const google = config.requireObject<Google>('google');
export const myEmail = config.requireSecret('myEmail');
export const myGoogleId = config.requireSecret('myGoogleId');
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
