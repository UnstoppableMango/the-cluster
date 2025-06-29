import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { versions } from './config';

const ns = new k8s.core.v1.Namespace('rook-ceph', {
	metadata: { name: 'rook-ceph' },
}, { provider });

const chart = new k8s.helm.v3.Chart('rook', {
	path: './',
	namespace: ns.metadata.name,
	values: {
		'rook-ceph': {
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
	},
}, { provider });

export const namespace = ns.metadata.name;
