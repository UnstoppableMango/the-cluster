import { Config } from '@pulumi/pulumi';

export interface GitHub {
  clientId: string;
  clientSecret: string;
}

const config = new Config();
export const github = config.requireObject<GitHub>('github');
