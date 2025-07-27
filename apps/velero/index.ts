import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config, interpolate } from '@pulumi/pulumi';
import z from 'zod';

const Versions = z.object({
	chart: z.string(),
	velero: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('velero-system', {
	metadata: { name: 'velero-system' },
});

const chart = new Chart('velero', {
	chart: 'velero',
	version: versions.chart,
	repositoryOpts: {
		repo: 'https://vmware-tanzu.github.io/helm-charts',
	},
	values: {
		image: {
			tag: interpolate`v${versions.velero}`,
		},
		resources: {
			requests: {
				cpu: '500m',
				memory: '128Mi',
			},
			limits: {
				cpu: '1000m',
				memory: '512Mi',
			},
		},
		upgradeJobResources: {
			requests: {
				cpu: '50m',
				memory: '128Mi',
			},
			limits: {
				cpu: '100m',
				memory: '256Mi',
			},
		},
		podSecurityContext: {
			fsGroup: 1337,
		},
		containerSecurityContext: {
			allowPrivilegeEscalation: false,
			capabilities: {
				drop: ['ALL'],
				add: [],
			},
			readOnlyRootFilesystem: true,
		},
		configuration: {
			backupStorageLocation: [],
			volumeSnapshotLocation: [],
		},
	},
});
