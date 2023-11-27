import { Config, getStack } from '@pulumi/pulumi';

export interface GitHub {
  clientId: string;
  clientSecret: string;
}

const config = new Config();
export const cluster = getStack();

export const github = config.requireObject<GitHub>('github');
export const hosts = config.requireObject<string[]>('hosts');
