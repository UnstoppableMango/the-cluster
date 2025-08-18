import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
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

export const adminPassword = password.result;
