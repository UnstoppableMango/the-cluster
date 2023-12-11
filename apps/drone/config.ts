import { Config } from '@pulumi/pulumi';

export interface GitHub {
  clientId: string;
  clientSecret: string;
  token: string;
}

export interface Hosts {
  internal: string;
  external: string;
}

export interface Versions {
  dind: string;
  drone: string;
  droneGc: string;
  droneRunnerDocker: string;
}

const config = new Config();
export const github = config.requireObject<GitHub>('github');
export const hosts = config.requireObject<Hosts>('hosts');
export const versions = config.requireObject<Versions>('versions');
export const userFilter = config.requireObject<string[]>('userFilter');
export const repoFilter = config.requireObject<string[]>('repoFilter');
export const dockerHost = config.require('dockerHost');
export const runnerRepos = config.requireObject<string[]>('runnerRepos');
export const seedUser = config.require('seedUser');
