import { core } from '@pulumi/kubernetes/types/input';
import { Config } from '@pulumi/pulumi';

export interface GitHub {
	appId: string;
}

export interface ScaleSet {
	name: string;
	githubUrl: string;
	installationId: string;
	minRunners: number;
	maxRunners: number;
	volumes?: core.v1.Volume[];
	volumeMounts?: core.v1.VolumeMount[];
}

export interface Versions {
	actionsRunner: string;
	actionsRunnerController: string;
	dind: string;
	rbacProxy: string;
	scaleSetController: string;
}

const config = new Config();
export const github = config.requireObject<GitHub>('github');
export const privateKey = config.require('private-key.pem');
export const scaleSets = config.requireObject<ScaleSet[]>('scalesets');
// export const versions = config.requireObject<Versions>('versions');
