import z from 'zod/v4';
import * as k8s from '@pulumi/kubernetes';
import { Config } from '@pulumi/pulumi';

const Versions = z.object({
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new k8s.core.v1.Namespace('rook-ceph', {
	metadata: { name: 'rook-ceph' },
});

const chart = new k8s.helm.v3.Chart('rook', {
	chart: 'rook-ceph',
	fetchOpts: {
		repo: 'https://charts.rook.io/release',
	},
	version: versions.chart,
	namespace: ns.metadata.name,
	values: {
		crds: { enabled: true },
		csi: {
			nfs: { enabled: false },
		},
		// Disabling for memory reasons on the smaller nodes
		enableDiscoveryDaemon: false,
		env: {},
		resources: {
			limits: {
				memory: '512Mi',
			},
			requests: {
				cpu: '200m',
				memory: '128Mi',
			},
		},
	},
});

export const namespace = ns.metadata.name;
