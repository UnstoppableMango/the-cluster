import { StatefulSet } from '@pulumi/kubernetes/apps/v1';
import { Namespace, PersistentVolumeClaim, Secret, Service, ServiceSpecType } from '@pulumi/kubernetes/core/v1';
import { Config } from '@pulumi/pulumi';

interface CurseForgeConfig {
	apiToken: string;
}

const config = new Config();
const curseForge = config.requireSecretObject<CurseForgeConfig>('curseForge');

const ns = new Namespace('slackpack', {
	metadata: { name: 'slackpack' },
});

const apiTokenKey = 'CF_API_KEY';

const secret = new Secret('slackpack', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		[apiTokenKey]: curseForge.apiToken,
	},
});

const svc = new Service('server', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		type: ServiceSpecType.LoadBalancer,
		selector: {
			'app.kubernetes.io/name': 'slackpack',
		},
		ports: [{
			name: 'minecraft',
			port: 25565,
		}],
	},
});

const modsPvc = new PersistentVolumeClaim('mods', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		accessModes: ['ReadWriteOncePod'],
		storageClassName: 'default-cephfs',
		resources: {
			requests: {
				storage: '5Gi',
			},
		},
	},
});

// const mounty = new Pod('mounty', {
//   metadata: { namespace: ns.metadata.name },
//   spec: {
//     containers: [{
//       name: 'mounty',
//       image: 'ubuntu:latest',
//       command: ['sh', '-c', 'sleep infinity'],
//       volumeMounts: [{
//         name: 'mods',
//         mountPath: '/mods',
//       }],
//     }],
//     volumes: [{
//       name: 'mods',
//       persistentVolumeClaim: {
//         claimName: modsPvc.metadata.name,
//       },
//     }],
//   },
// });

const sts = new StatefulSet('slackpack', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		serviceName: svc.metadata.name,
		selector: {
			matchLabels: {
				'app.kubernetes.io/name': 'slackpack',
			},
		},
		template: {
			metadata: {
				labels: {
					'app.kubernetes.io/name': 'slackpack',
				},
			},
			spec: {
				containers: [{
					name: 'server',
					image: 'itzg/minecraft-server:stable',
					imagePullPolicy: 'Always',
					ports: [{
						name: 'minecraft',
						containerPort: 25565,
					}],
					env: [
						{ name: 'ALLOW_FLIGHT', value: 'true' },
						{ name: 'EULA', value: 'true' },
						{ name: 'VERSION', value: '1.21.1' },
						{ name: 'INIT_MEMORY', value: '4G' },
						{ name: 'MAX_MEMORY', value: '32G' },
						{ name: 'MODPACK_PLATFORM', value: 'AUTO_CURSEFORGE' },
						{
							name: 'CF_API_KEY',
							valueFrom: {
								secretKeyRef: {
									name: secret.metadata.name,
									key: apiTokenKey,
								},
							},
						},
						{
							name: 'CF_PAGE_URL',
							value: 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-10/files/6696915',
						},
					],
					volumeMounts: [
						{ name: 'mods', mountPath: '/modpacks', readOnly: true },
						{ name: 'data', mountPath: '/data' },
					],
					resources: {
						requests: {
							cpu: '4',
							memory: '8Gi',
						},
						limits: {
							cpu: '16',
							memory: '32Gi',
						},
					},
				}],
				volumes: [{
					name: 'mods',
					persistentVolumeClaim: {
						claimName: modsPvc.metadata.name,
						readOnly: true,
					},
				}],
			},
		},
		volumeClaimTemplates: [{
			metadata: { name: 'data' },
			spec: {
				accessModes: ['ReadWriteOnce'],
				storageClassName: 'ssd-rbd',
				resources: {
					requests: {
						storage: '100Gi',
					},
				},
			},
		}],
	},
});
