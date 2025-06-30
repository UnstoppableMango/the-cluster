import * as pulumi from '@pulumi/pulumi';

export interface Versions {
	pulumiOperator: string;
}

export interface Stacks {
	commit: string;
	name: string;
}

const config = new pulumi.Config();
export const versions = config.requireObject<Versions>('versions');
