import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config } from '@pulumi/pulumi';
import z from 'zod/v4';

const Versions = z.object({
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('arc-system', {
	metadata: { name: 'arc-system' },
});

const chart = new Chart('gha-runner-scale-set', {
	chart: 'oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set-controller',
	version: versions.chart,
	namespace: ns.metadata.name,
	values: {
		replicaCount: 2,
		securityContext: {
			capabilities: { drop: ['ALL'] },
			readOnlyRootFilesystem: true,
			runAsNonRoot: true,
			runAsUser: 1001,
		},
		resources: {
			limits: {
				cpu: '100m',
				memory: '128Mi',
			},
			requests: {
				cpu: '100m',
				memory: '128Mi',
			},
		},
	},
});
