import * as k8s from '@pulumi/kubernetes';
import { core } from '@pulumi/kubernetes/types/input';
import * as pulumi from '@pulumi/pulumi';
import { apps, provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { github, privateKey, scaleSets } from './config';

export const namespaces: pulumi.Output<string>[] = [];

for (const set of scaleSets) {
	const ns = new k8s.core.v1.Namespace(`${set.name}-actions-runners`, {
		metadata: { name: `${set.name}-actions-runners` },
	}, { provider });

	namespaces.push(ns.metadata.name);

	const authSecret = new k8s.core.v1.Secret(set.name, {
		metadata: {
			name: set.name,
			namespace: ns.metadata.name,
		},
		stringData: {
			github_app_id: github.appId,
			github_app_installation_id: set.installationId,
			github_app_private_key: privateKey,
		},
	}, { provider });

	const chart = new k8s.helm.v3.Chart(set.name, {
		path: './',
		namespace: ns.metadata.name,
		values: {
			// https://github.com/actions/actions-runner-controller/blob/master/charts/gha-runner-scale-set/values.yaml
			'gha-runner-scale-set': {
				githubConfigUrl: set.githubUrl,
				// This produces a warning about `cannot overwrite table [...]` but its actually intended
				// https://github.com/actions/actions-runner-controller/blob/3e4201ac5f6c6d172a19b580154eaf5abf24a2ca/charts/gha-runner-scale-set/templates/githubsecret.yaml#L1
				githubConfigSecret: authSecret.metadata.name,
				controllerServiceAccount: {
					name: apps.actionsRunnerController.serviceAccount,
					namespace: apps.actionsRunnerController.namespace,
				},
				minRunners: set.minRunners,
				maxRunners: set.maxRunners,
				runnerScaleSetName: set.name,
				containerMode: {
					type: 'kubernetes',
				},
				// https://github.com/actions/actions-runner-controller/blob/3e4201ac5f6c6d172a19b580154eaf5abf24a2ca/charts/gha-runner-scale-set/values.yaml#L162-L189
				template: <core.v1.Pod> {
					spec: {
						securityContext: {
							runAsUser: 1001,
							runAsGroup: 1001,
							fsGroup: 1001,
						},
						topologySpreadConstraints: [{
							maxSkew: 1,
							topologyKey: 'kubernetes.io/hostname',
							whenUnsatisfiable: 'ScheduleAnyway',
							labelSelector: {
								matchLabels: {
									'actions.github.com/scale-set-name': set.name,
								},
							},
						}],
						containers: [{
							name: 'runner',
							image: 'ghcr.io/actions/actions-runner:latest',
							command: ['/home/runner/run.sh'],
							env: [
								{ name: 'ACTIONS_RUNNER_REQUIRE_JOB_CONTAINER', value: 'true' },
								// { name: 'ACTIONS_RUNNER_HOOK_JOB_STARTED', value: '/opt/runner/hooks/clean-pvs.sh' },
								// { name: 'ACTIONS_RUNNER_HOOK_JOB_COMPLETED', value: '/opt/runner/hooks/clean-pvs.sh' },
								// { name: 'npm_config_cache', value: '__w/.npm' }
							],
							volumeMounts: [
								...set.volumeMounts ?? [],
								{
									name: 'work',
									mountPath: '/home/runner/_work',
									subPathExpr: '$(ACTIONS_RUNNER_POD_NAME)',
								},
							],
						}],
						volumes: [
							...set.volumes ?? [],
							{
								name: 'work',
								ephemeral: {
									volumeClaimTemplate: {
										spec: {
											// Explicit opt-out of dynamic provisioning
											storageClassName: '',
											accessModes: ['ReadWriteMany'],
											selector: {
												matchLabels: {
													'thecluster.io/role': 'actions-runner',
												},
											},
											resources: {
												requests: {
													storage: '100Gi',
												},
											},
										},
									},
								},
							},
						],
					},
				},
			},
		},
		transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
			opts.dependsOn = [authSecret];
			// TODO: I think we need a cluster role for this...
			// if (obj.kind === 'Role' && obj.metadata.name === 'thecluster-gha-rs-kube-mode') {
			//   obj.rules.push([
			//     { apiGroups: [''], resources: ['persistentvolumes'], verbs: ['list'] },
			//   ]);
			// }
		}],
	}, { provider });
}
