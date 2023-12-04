import { Config, getStack } from '@pulumi/pulumi';

export interface Versions {
  unifi: string;
}

const config = new Config();
export const cluster = getStack();
// export const versions = config.requireObject<Versions>('versions');
