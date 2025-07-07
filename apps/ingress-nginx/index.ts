import { Namespace } from '@pulumi/kubernetes/core/v1';
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

const ns = new Namespace('ingress-nginx', {
	metadata: { name: 'ingress-nginx' },
});

const chart = new Chart('ingress-nginx', {
	chart: 'ingress-nginx',
	version: versions.chart,
	repositoryOpts: {
		repo: 'https://kubernetes.github.io/ingress-nginx',
	},
	namespace: ns.metadata.name,
	values: {
		controller: {
			image: { tag: `v${versions.app}` },
			kind: 'DaemonSet',
			admissionWebhooks: {
				certManager: { enabled: true },
			},
			// Preserve source IPs when using MetalLB
			// https://kubernetes.github.io/ingress-nginx/deploy/baremetal/#a-pure-software-solution-metallb
			service: { externalTrafficPolicy: 'Local' },
		},
	},
});
