import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config } from '@pulumi/pulumi';
import z from 'zod';

const Versions = z.object({
	instanceChart: z.string(),
	operatorChart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const GitHub = z.object({
	githubAppID: z.string(),
	githubAppInstallationID: z.string(),
	githubAppPrivateKey: z.string(),
});

type GitHub = z.infer<typeof GitHub>;

const config = new Config();
const github = GitHub.parse(config.requireObject('github'));
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('flux-system', {
	metadata: { name: 'flux-system' },
});

const githubSecret = new Secret('github', {
	metadata: { namespace: ns.metadata.name },
	stringData: github,
});

const operatorChart = new Chart('flux-operator', {
	chart: 'oci://ghcr.io/controlplaneio-fluxcd/charts/flux-operator',
	namespace: ns.metadata.name,
	version: versions.operatorChart,
});

const instanceChart = new Chart('flux', {
	chart: 'oci://ghcr.io/controlplaneio-fluxcd/charts/flux-instance',
	namespace: ns.metadata.name,
	version: versions.instanceChart,
	values: {
		instance: {
			cluster: {
				domain: 'cluster.local',
				size: 'large',
			},
			storage: {
				class: 'ssd-rbd',
				size: '10Gi',
			},
			components: [
				'source-controller',
				'kustomize-controller',
				'helm-controller',
				'notification-controller',
				'image-reflector-controller',
				'image-automation-controller',
			],
			distribution: {
				registry: 'ghcr.io/fluxcd',
				version: '2.x',
			},
			sync: {
				kind: 'GitRepository',
				provider: 'github',
				url: 'https://github.com/UnstoppableMango/the-cluster.git',
				ref: 'refs/heads/main',
				path: 'flux/clusters/pinkdiamond',
				pullSecret: githubSecret.metadata.name,
			},
		},
	},
});
