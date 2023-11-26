import { Config, getStack } from '@pulumi/pulumi';

export interface Auth {
  adminUser: string;
}

export interface Postgres {
  username: string;
}

const config = new Config();
export const cluster = getStack();

export const auth = config.requireObject<Auth>('auth');
export const production = config.requireBoolean('production');
export const postgres = config.requireObject<Postgres>('postgres');
export const hostname = config.require('hostname');
