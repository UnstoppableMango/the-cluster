import { Config } from '@pulumi/pulumi';

export interface GitHub {
  appId: string;
  installationId: string;
}

export interface Host {
  external: string;
}

export interface Hosts {
  metrics: Host;
  webhook: Host;
}

export interface Versions {
  actionsRunner: string;
  actionsRunnerController: string;
  dind: string;
  rbacProxy: string;
  scaleSetController: string;
}

const config = new Config();
export const github = config.requireObject<GitHub>('github');
export const hosts = config.requireObject<Hosts>('hosts');
export const privateKey = config.require('private-key.pem');
export const versions = config.requireObject<Versions>('versions');
