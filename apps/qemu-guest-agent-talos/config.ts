import { Config } from '@pulumi/pulumi';

export interface Versions {
  customImage: string;
  qemuGuestAgentTalos: string;
}

const config = new Config();

export const versions = config.requireObject<Versions>('versions');
