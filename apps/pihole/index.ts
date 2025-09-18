import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Ingress } from '@pulumi/kubernetes/networking/v1';
import { ConfigFile, ConfigGroup } from '@pulumi/kubernetes/yaml/v2';
import { Config, interpolate } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';
import z from 'zod/v4';

const Instance = z.object({
	name: z.string(),
	loadBalancerIP: z.string(),
});

const Versions = z.object({
	chart: z.string(),
	docker: z.string(),
	externalDns: z.object({
		chart: z.string(),
		docker: z.string(),
	}),
});

type Instance = z.infer<typeof Instance>;
type Versions = z.infer<typeof Versions>;

const config = new Config();
const instances = z.array(Instance).parse(config.requireObject('instances'));
const versions = Versions.parse(config.requireObject('versions'));

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

const charts = instances.map(({ name, loadBalancerIP }) =>
	new Chart(name, {
		chart: 'pihole',
		repositoryOpts: {
			repo: 'https://mojo2600.github.io/pihole-kubernetes',
		},
		namespace: ns.metadata.name,
		version: versions.chart,
		// https://artifacthub.io/packages/helm/mojo2600/pihole#values
		values: {
			replicaCount: 1,
			strategyType: 'Recreate',
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
				webserver_domain: `${name}.thecluster.lan`,
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
			persistentVolumeClaim: {
				enabled: true,
				storageClass: 'ssd-rbd',
				accessModes: ['ReadWriteOncePod'],
				size: '500Mi', // default
			},
			topologySpreadConstraints: [{
				maxSkew: 1,
				topologyKey: 'kubernetes.io/hostname',
				whenUnsatisfiable: 'DoNotSchedule',
				labelSelector: {
					matchLabels: {
						'app.kubernetes.io/name': 'pihole',
					},
				},
			}],
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
	})
);

const ingress = new Ingress('pihole', {
	metadata: {
		namespace: ns.metadata.name,
		annotations: {
			'cert-manager.io/issuer-group': 'cert-manager.io',
			'cert-manager.io/issuer-kind': 'ClusterIssuer',
			'cert-manager.io/issuer': 'thecluster.lan',
		},
	},
	spec: {
		ingressClassName: 'nginx',
		rules: instances.map(({ name }) => ({
			host: `${name}.thecluster.lan`,
			http: {
				paths: [{
					pathType: 'Prefix',
					path: '/',
					backend: {
						service: {
							name: `${name}-web`,
							port: {
								name: 'http',
							},
						},
					},
				}],
			},
		})),
		tls: [{
			secretName: 'pihole-tls',
			hosts: instances.map(({ name }) => `${name}.thecluster.lan`),
		}],
	},
});

const crds = new ConfigGroup('crds', {
	files: ['crds/dnsendpoints.externaldns.k8s.io.yaml'].map(url => {
		return `https://raw.githubusercontent.com/kubernetes-sigs/external-dns/refs/tags/v${versions.externalDns.docker}/charts/external-dns/${url}`;
	}),
});

const externalDns = instances.map(({ name }) =>
	new Chart(`${name}-external-dns`, {
		chart: 'external-dns',
		version: versions.externalDns.chart,
		repositoryOpts: {
			repo: 'https://kubernetes-sigs.github.io/external-dns',
		},
		namespace: ns.metadata.name,
		skipCrds: true,
		// https://github.com/kubernetes-sigs/external-dns/blob/master/charts/external-dns/values.yaml
		values: {
			image: {
				repository: 'registry.k8s.io/external-dns/external-dns',
				tag: interpolate`v${versions.externalDns.docker}`,
			},
			resources: {
				requests: {
					cpu: '100m',
					memory: '128Mi',
				},
				limits: {
					cpu: '500m',
					memory: '512Mi',
				},
			},
			// https://kubernetes-sigs.github.io/external-dns/latest/docs/tutorials/pihole/#arguments
			env: [
				{
					name: 'EXTERNAL_DNS_PIHOLE_PASSWORD',
					valueFrom: {
						secretKeyRef: {
							name: sec.metadata.name,
							key: passwordKey,
						},
					},
				},
				{ name: 'EXTERNAL_DNS_PIHOLE_SERVER', value: `http://${name}-web.pihole.svc.cluster.local` },
				{ name: 'EXTERNAL_DNS_PIHOLE_TLS_SKIP_VERIFY', value: 'true' },
				{ name: 'EXTERNAL_DNS_PIHOLE_API_VERSION', value: '6' },
			],
			registry: 'noop', // Pi-hole doesn't manage TXT records
			provider: {
				name: 'pihole',
			},
		},
	})
);

export const adminPassword = password.result;
export { instances };
