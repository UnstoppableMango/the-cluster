import { Config, getStack } from '@pulumi/pulumi';

export interface Versions {
	externalSnapshotter: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
