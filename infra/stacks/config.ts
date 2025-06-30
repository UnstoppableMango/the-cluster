import { Config } from '@pulumi/pulumi';

interface Versions {
  pulumiImage: string;
}

const config = new Config();

export const versions = config.requireObject<Versions>('versions');
