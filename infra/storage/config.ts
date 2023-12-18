import { Config } from '@pulumi/pulumi';

export interface ActionsRunnerController {
  count: number;
}

export interface Volume {
  name: string;
  size: string;
  mode: string;
  accessModes: string[];
  storageClass: string;
  namespace?: string;
  fsType?: string;
}

const config = new Config();
export const actionsRunnerController = config.requireObject<
  ActionsRunnerController
>('actions-runner-controller');
export const volumes = config.requireObject<Volume[]>('volumes');
