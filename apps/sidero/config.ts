import * as pulumi from '@pulumi/pulumi';

interface Versions {
  uefi: string;
}

const config = new pulumi.Config();
export const versions = config.requireObject<Versions>('versions');
