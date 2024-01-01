import { Config } from '@pulumi/pulumi';

export interface ActionsRunnerController {
  count: number;
}

export interface CephCred {
  userId: string;
  userKey: string;
}

export interface Volume {
  name: string;
  size: string;
  mode: string;
  accessModes: string[];
  storageClass: string;
  namespace?: string;
  fsType?: string;
  labels?: Record<string, string>;
}

const config = new Config();
export const actionsRunnerController = config.requireObject<ActionsRunnerController>('actions-runner-controller');
export const volumes = config.requireObject<Volume[]>('volumes');
export const cephfs = config.requireObject<CephCred>('cephfs');
