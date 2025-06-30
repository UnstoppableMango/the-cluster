import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config, output } from '@pulumi/pulumi';
import * as YAML from 'yaml';

const config = new Config();

const ns = new Namespace('unstoppablemango-runners', {
	metadata: { name: 'unstoppablemango-runners' },
});

const secret = new Secret('github-config', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		github_app_id: '169402', // THECLUSTER Bot
		github_app_installation_id: '22901293', // UnstoppableMango
		github_app_private_key: config.requireSecret('private-key'),
	},
});

const hookExtension = new ConfigMap('hook-extension', {
	metadata: {
		name: 'hook-extension',
		namespace: ns.metadata.name,
	},
	data: {
		content: output({
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

const chart = new Chart('lang-runner-scale-set', {
	name: 'lang-runners', // INSTALLATION_NAME, used for runs-on in workflows
	namespace: ns.metadata.name,
	chart: 'oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set',
	values: {
		githubConfigUrl: 'https://github.com/UnstoppableMango/lang',
		githubConfigSecret: secret.metadata.name,
		containerMode: {
			type: 'kubernetes',
			kubernetesModeWorkVolumeClaim: {
				accessModes: ['ReadWriteOnce'],
				storageClassName: 'unsafe-rbd',
				resources: {
					requests: {
						// LLVM is chonky I guess
						storage: '250Gi',
					},
				},
			},
		},
		template: {
			spec: {
				securityContext: {
					fsGroup: 1001,
				},
				containers: [{
					name: 'runner',
					image: 'ghcr.io/actions/actions-runner:latest',
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
