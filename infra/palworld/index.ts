import { Record } from '@pulumi/cloudflare';
import { getZonesOutput, GetZonesResult } from '@pulumi/cloudflare/getZones';
import { StatefulSet } from '@pulumi/kubernetes/apps/v1';
import { Namespace, Secret, Service, ServiceSpecType } from '@pulumi/kubernetes/core/v1';
import { Ingress } from '@pulumi/kubernetes/networking/v1';
import { Config } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';

const config = new Config();

const ns = new Namespace('palworld', {
	metadata: { name: 'palworld' },
});

export const serverPassword = config.requireSecret('password');
const admin = new RandomPassword('admin', { length: 12 });

const serverPasswordKey = 'serverPassword';
const adminPasswordKey = 'adminPassword';

const secret = new Secret('palworld', {
	metadata: {
		name: 'palworld',
		namespace: ns.metadata.name,
	},
	stringData: {
    [serverPasswordKey]: serverPassword,
		[adminPasswordKey]: admin.result,
	},
});

const service = new Service('palworld', {
	metadata: {
		name: 'palworld',
		namespace: ns.metadata.name,
		labels: { 'app.kubernetes.io/name': 'palworld' },
	},
	spec: {
		selector: { 'app.kubernetes.io/name': 'palworld' },
		type: ServiceSpecType.LoadBalancer,
		ports: [
			{ name: 'server', port: 8211, protocol: 'UDP' },
			{ name: 'query', port: 27015, protocol: 'UDP' },
			{ name: 'rest', port: 8212, protocol: 'UDP' },
		],
	},
});

const statefulSet = new StatefulSet('palworld', {
	metadata: {
		name: 'palworld',
		namespace: ns.metadata.name,
	},
	spec: {
		selector: {
			matchLabels: {
				'app.kubernetes.io/name': 'palworld',
			},
		},
		serviceName: service.metadata.name,
		template: {
			metadata: {
				labels: {
					'app.kubernetes.io/name': 'palworld',
				},
			},
			spec: {
				containers: [{
					name: 'palworld',
					image: 'thijsvanloef/palworld-server-docker:latest',
					ports: [
						{ name: 'http', containerPort: 8211, protocol: 'UDP' },
						{ name: 'query', containerPort: 27015, protocol: 'UDP' },
						{ name: 'rest', containerPort: 8212, protocol: 'UDP' },
					],
					env: [
						{ name: 'PUID', value: '1000' },
						{ name: 'PGID', value: '1000' },
						{ name: 'PORT', value: '8211' },
						{ name: 'PLAYERS', value: '16' },
						{ name: 'MULTITHREADING', value: 'true' },
						{ name: 'REST_API_ENABLED', value: 'true' }, // Is this different than RCON?
						{ name: 'RCON_ENABLED', value: 'true' },
						{ name: 'RCON_PORT', value: '25575' },
						{ name: 'TZ', value: 'UTC' },
						{ name: 'COMMUNITY', value: 'false' },
						{ name: 'SERVER_NAME', value: 'THECLUSTER' },
						{ name: 'SERVER_DESCRIPTION', value: 'THECLUSTER PalWorld server' },
						{ name: 'CROSSPLAY_PLATFORMS', value: '(Steam,Xbox,PS5,Mac)' },
            {
              name: 'SERVER_PASSWORD',
              valueFrom: {
                secretKeyRef: {
                  name: secret.metadata.name,
                  key: serverPasswordKey,
                },
              },
            },
						{
							name: 'ADMIN_PASSWORD',
							valueFrom: {
								secretKeyRef: {
									name: secret.metadata.name,
									key: adminPasswordKey,
								},
							},
						},
						{ name: 'BASE_CAMP_WORKER_MAX_NUM', value: '20' },
					],
					resources: {
						requests: {
							cpu: '4',
							memory: '4Gi',
						},
						limits: {
							cpu: '8',
							memory: '16Gi',
						},
					},
					volumeMounts: [{
						name: 'data',
						mountPath: '/palworld',
					}],
				}],
			},
		},
		volumeClaimTemplates: [{
			metadata: { name: 'data' },
			spec: {
				storageClassName: 'unsafe-rbd',
				accessModes: ['ReadWriteOncePod'],
				resources: {
					requests: {
						storage: '24Gi',
					},
				},
			},
		}],
	},
});

// const ingress = new Ingress('palworld', {
//   metadata: {
//     name: 'palworld',
//     namespace: ns.metadata.name,
//     annotations: {
//       'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
//       'pulumi.com/skipAwait': 'true',
//     },
//   },
//   spec: {
//     ingressClassName: 'thecluster-io',
//     rules: [{
//       host: 'palworld.thecluster.io',
//       http: {
//         paths: [{
//           pathType: 'Prefix',
//           path: '/',
//           backend: {
//             service: {
//               name: service.metadata.name,
//               port: {
//                 number: 8211,
//               },
//             },
//           },
//         }],
//       },
//     }],
//   },
// });

const zones = getZonesOutput({
  filter: { name: 'thecluster.io' },
});

const record = new Record('palworld', {
  name: 'palworld.thecluster.io',
  type: 'CNAME',
  zoneId: zones.apply(zoneId),
  content: 'thecluster.io',
});

export const adminPassword = admin.result;

function zoneId(res: GetZonesResult): string {
  const zone = res.zones[0];
  return zone.id ?? '';
}
