import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import * as pulumi from '@pulumi/pulumi';
import * as YAML from 'yaml';
import z from 'zod/v4';

const Versions = z.object({
	actionsRunner: z.string(),
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new pulumi.Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('unmango-runners', {
	metadata: { name: 'unmango-runners' },
});

const secret = new Secret('github-config', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		github_app_id: config.require('app-id'),
		github_app_installation_id: config.require('installation-id'),
		github_app_private_key: config.requireSecret('private-key'),
	},
});

const hookExtension = new ConfigMap('hook-extension', {
	metadata: {
		name: 'hook-extension',
		namespace: ns.metadata.name,
	},
	data: {
		content: pulumi.output({
			spec: {
				containers: [{
					name: '$job',
					securityContext: {
						fsGroup: 1001,
					},
					resources: {
						requests: {
							cpu: '4',
							memory: '4Gi',
						},
						limits: {
							cpu: '16',
							memory: '16Gi',
						},
					},
				}],
			},
		}).apply(YAML.stringify),
	},
});

const chart = new Chart('unmango-runners', {
	name: 'thecluster', // INSTALLATION_NAME, used for runs-on in workflows
	namespace: ns.metadata.name,
	chart: 'oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set',
	version: versions.chart,
	values: {
		githubConfigUrl: 'https://github.com/unmango',
		githubConfigSecret: secret.metadata.name,
		containerMode: {
			type: 'kubernetes',
			kubernetesModeWorkVolumeClaim: {
				accessModes: ['ReadWriteOnce'],
				storageClassName: 'unsafe-rbd',
			},
		},
		template: {
			spec: {
				securityContext: {
					fsGroup: 1001,
				},
				containers: [{
					name: 'runner',
					image: pulumi.interpolate`ghcr.io/actions/actions-runner:${versions.actionsRunner}`,
					command: ['/home/runner/run.sh'],
					env: [{
						name: 'ACTIONS_RUNNER_CONTAINER_HOOK_TEMPLATE',
						value: '/home/runner/hooks/hook-extension.yml',
					}],
					resources: {
						requests: {
							cpu: '10m',
							memory: '128Mi',
						},
						limits: {
							cpu: '100m',
							memory: '2Gi',
						},
					},
					volumeMounts: [{
						name: 'hook-extension',
						mountPath: '/home/runner/hooks',
					}],
				}],
				volumes: [{
					name: 'hook-extension',
					configMap: {
						name: hookExtension.metadata.name,
						items: [{
							key: 'content',
							path: 'hook-extension.yml',
						}],
					},
				}],
			},
		},
	},
});
