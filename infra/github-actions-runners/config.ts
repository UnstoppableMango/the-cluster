import { Config } from '@pulumi/pulumi';

export interface GitHub {
  appId: string;
  installationId: string;
}

export interface ScaleSet {
  name: string;
  githubUrl: string;
  minRunners: number;
  maxRunners: number;
  volumeSize: string;
  podTemplate?: unknown;
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
export const privateKey = config.require('private-key.pem');
export const scaleSets = config.requireObject<ScaleSet[]>('scalesets');
// export const versions = config.requireObject<Versions>('versions');
