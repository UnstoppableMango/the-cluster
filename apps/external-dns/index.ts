import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config, interpolate, StackReference } from '@pulumi/pulumi';
import z from 'zod';

const Versions = z.object({
	app: z.string(),
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const piholeStack = new StackReference('UnstoppableMango/thecluster-pihole/pinkdiamond');

const ns = new Namespace('external-dns', {
	metadata: { name: 'external-dns' },
});

const piholePasswordKey = 'EXTERNAL_DNS_PIHOLE_PASSWORD';

const sec = new Secret('pihole', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		[piholePasswordKey]: piholeStack.requireOutput('adminPassword'),
	},
});

const chart = new Chart('pihole', {
	chart: 'external-dns',
	version: versions.chart,
	repositoryOpts: {
		repo: 'https://kubernetes-sigs.github.io/external-dns',
	},
	namespace: ns.metadata.name,
	// https://github.com/kubernetes-sigs/external-dns/blob/master/charts/external-dns/values.yaml
	values: {
		image: {
			repository: 'registry.k8s.io/external-dns/external-dns',
			tag: interpolate`v${versions.app}`,
		},
		resources: {
			requests: {
				cpu: '10m',
				memory: '256Mi',
			},
			limits: {
				cpu: '100m',
				memory: '1Gi',
			},
		},
		// https://kubernetes-sigs.github.io/external-dns/latest/docs/tutorials/pihole/#arguments
		env: [
			{
				name: 'EXTERNAL_DNS_PIHOLE_PASSWORD',
				valueFrom: {
					secretKeyRef: {
						name: sec.metadata.name,
						key: piholePasswordKey,
					},
				},
			},
			{ name: 'EXTERNAL_DNS_PIHOLE_SERVER', value: 'http://pihole-web.pihole.svc.cluster.local' },
			{ name: 'EXTERNAL_DNS_PIHOLE_TLS_SKIP_VERIFY', value: 'true' },
			{ name: 'EXTERNAL_DNS_PIHOLE_API_VERSION', value: '6' },
		],
		registry: 'noop', // Pi-hole doesn't manage TXT records
		provider: {
			name: 'pihole',
		},
	},
});
