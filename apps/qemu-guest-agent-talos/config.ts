import { Config } from '@pulumi/pulumi';

export interface Versions {
  'qemu-guest-agent-talos': string;
}

const config = new Config();

export const versions = config.requireObject<Versions>('versions');
