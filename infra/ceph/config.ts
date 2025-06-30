import { Config, getStack } from '@pulumi/pulumi';

export interface Versions {
	ceph: string;
	rook: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const clusterName = getStack();
