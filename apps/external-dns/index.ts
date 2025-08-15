import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import * as pulumi from '@pulumi/pulumi';
import z from 'zod';

const Versions = z.object({
	app: z.string(),
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new pulumi.Config();
const versions = Versions.parse(config.requireObject('versions'));

const piholeStack = new pulumi.StackReference('UnstoppableMango/thecluster-pihole/pinkdiamond');

const ns = new Namespace('external-dns', {
	metadata: { name: 'external-dns' },
});

const sec = new Secret('external-dns', {
	metadata: { namespace: ns.metadata.name },
	stringData: {

	},
});

const chart = new Chart('external-dns', {
	chart: 'external-dns',
	version: versions.chart,
	repositoryOpts: {
		repo: 'https://kubernetes-sigs.github.io/external-dns',
	},
	namespace: ns.metadata.name,
	values: {
		image: {
			repository: 'registry.k8s.io/external-dns/external-dns',
			tag: versions.app,
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
	},
});
