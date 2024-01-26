import { Config } from '@pulumi/pulumi';

export interface Versions {
}

const config = new Config();
export const versions = config.getObject<Versions>('versions');
