import { Namespace, Secret, Service } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';
import z from 'zod';

const Versions = z.object({
	chart: z.string(),
	docker: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));
const loadBalancerIP = config.require('loadBalancerIP');

const ns = new Namespace('pihole', {
	metadata: { name: 'pihole' },
});

const password = new RandomPassword('pihole', {
	length: 48,
});

const passwordKey = 'password';

const sec = new Secret('pihole', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		[passwordKey]: password.result,
	},
});

const chart = new Chart('pihole', {
	chart: 'pihole',
	repositoryOpts: {
		repo: 'https://mojo2600.github.io/pihole-kubernetes',
	},
	namespace: ns.metadata.name,
	version: versions.chart,
	// https://artifacthub.io/packages/helm/mojo2600/pihole#values
	values: {
		replicaCount: 1,
		image: {
			repository: 'pihole/pihole', // default
			tag: versions.docker,
		},
		DNS1: '1.1.1.1',
		DNS2: '1.0.0.1',
		podDnsConfig: {
			enabled: true,
			policy: 'None',
			nameservers: [
				'127.0.0.1',
				'1.1.1.1',
			],
		},
		admin: {
			existingSecret: sec.metadata.name,
			passwordKey: passwordKey,
		},
		ftl: {
			dhcp_active: 'false',
			dns_domain: 'thecluster.lan',
			webserver_domain: 'pihole.thecluster.lan',
			webserver_interface_theme: 'default-darker',
			// webserver_tls_cert: '/etc/pihole/tls.pem',
			// webserver_paths_prefix: '',
			misc_readonly: 'true',
			ntp_ipv4_active: 'false',
			ntp_ipv6_active: 'false',
			ntp_sync_server: 'pool.ntp.org', // default
			resolver_resolveIPv4: 'true',
			resolver_resolveIPv6: 'false',
		},
		extraEnvVars: {
			FTLCONF_webserver_port: '80,443',
			TZ: 'America/Chicago',
		},
		capabilities: {
			add: ['SYS_NICE'],
		},
		serviceDns: {
			mixedService: true,
			type: 'LoadBalancer',
			loadBalancerIP,
		},
		serviceDhcp: { enabled: false },
		ingress: {
			enabled: true,
			ingressClassName: 'nginx',
			hosts: ['pihole.thecluster.lan'],
		},
		resources: {
			requests: {
				cpu: '50m',
				memory: '64Mi',
			},
			limits: {
				cpu: '200m',
				memory: '512Mi',
			},
		},
	},
});

// const svc = new Service('pihole', {
// 	metadata: { namespace: ns.metadata.name },
// 	spec: {
// 		type: 'LoadBalancer',
// 		ports: [
// 			{ name: 'dns-tcp', port: 53, protocol: 'TCP' },
// 			{ name: 'dns-udp', port: 53, protocol: 'UDP' },
// 			{ name: 'https', port: 443 },
// 		],
// 		selector: {
// 			'app.kubernetes.io/name': 'pihole',
// 		},
// 	},
// });

// const sts = new StatefulSet('pihole', {
// 	metadata: { namespace: ns.metadata.name },
// 	spec: {
// 		serviceName: svc.metadata.name,
// 		selector: {
// 			matchLabels: {
// 				'app.kubernetes.io/name': 'pihole',
// 			},
// 		},
// 		template: {
// 			metadata: {
// 				labels: {
// 					'app.kubernetes.io/name': 'pihole',
// 				},
// 			},
// 			spec: {
// 				dnsConfig: {
// 					options: [
// 						{ name: 'ndots', value: '1' },
// 					],
// 				},
// 				containers: [{
// 					name: 'pihole',
// 					image: interpolate`pihole/pihole:${versions.docker}`,
// 					ports: [
// 						{ name: 'dns-tcp', containerPort: 53, protocol: 'TCP' },
// 						{ name: 'dns-udp', containerPort: 53, protocol: 'UDP' },
// 						{ name: 'https', containerPort: 443 },
// 					],
// 					env: [
// 						{ name: 'TZ', value: 'America/Chicago' },
// 						{ name: 'FTLCONF_webserver_interface_theme', value: 'default-darker' },
// 						{
// 							name: 'FTLCONF_webserver_api_password',
// 							valueFrom: {
// 								secretKeyRef: {
// 									name: sec.metadata.name,
// 									key: passwordKey,
// 								},
// 							},
// 						},
// 						// { name: 'FTLCONF_dns_listeningMode', value: 'all' },
// 						{ name: 'FTLCONF_dns_upstreams', value: '1.1.1.1;1.0.0.1' },
// 						{ name: 'FTLCONF_misc_readOnly', value: 'true' },
// 					],
// 					volumeMounts: [
// 						{ name: 'config', mountPath: '/etc/pihole' },
// 					],
// 					securityContext: {
// 						capabilities: {
// 							add: ['SYS_NICE'],
// 						},
// 					},
// 				}],
// 				volumes: [
// 					{
// 						name: 'config',
// 						persistentVolumeClaim: {
// 							claimName: 'config',
// 						},
// 					},
// 				],
// 			},
// 		},
// 		volumeClaimTemplates: [
// 			{
// 				metadata: { name: 'config' },
// 				spec: {
// 					storageClassName: 'ssd-rbd',
// 					accessModes: ['ReadWriteOncePod'],
// 					resources: {
// 						requests: {
// 							storage: '5Gi',
// 						},
// 					},
// 				},
// 			},
// 		],
// 	},
// });

export const adminPassword = password.result;
