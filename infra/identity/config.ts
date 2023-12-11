import { Config, getStack } from '@pulumi/pulumi';

export interface GitHub {
  clientId: string;
  clientSecret: string;
}

export interface Google {
  clientId: string;
  clientSecret: string;
}

export interface Me {
  firstName: string;
  lastName: string;
  email: string;
}

const config = new Config();
export const cluster = getStack();
export const github = config.requireObject<GitHub>('github');
export const google = config.requireObject<Google>('google');
export const me = config.requireObject<Me>('me');
