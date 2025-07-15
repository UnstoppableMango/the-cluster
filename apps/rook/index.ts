import z from 'zod/v4';
import * as k8s from '@pulumi/kubernetes';
import { Config } from '@pulumi/pulumi';
import { ConfigMap, Secret } from '@pulumi/kubernetes/core/v1';

const Versions = z.object({
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new k8s.core.v1.Namespace('rook-ceph', {
	metadata: { name: 'rook-ceph' },
});

const rookCephMonSecret = new Secret('rook-ceph-mon', {
	metadata: {
		name: 'rook-ceph-mon',
		namespace: ns.metadata.name,
		finalizers: ['ceph.rook.io/disaster-protection'],
	},
	stringData: {
		'ceph-secret': config.requireSecret('ceph-secret'),
		'ceph-username': config.requireSecret('ceph-username'),
		'mon-secret': config.requireSecret('mon-secret'),
		fsid: config.requireSecret('fsid'),
	},
});

const rookCephMonEndpoints = new ConfigMap('rook-ceph-mon-endpoints', {
	metadata: {
		name: 'rook-ceph-mon-endpoints',
		namespace: ns.metadata.name,
		finalizers: ['ceph.rook.io/disaster-protection'],
	},
	data: {
		'csi-cluster-config-json': '[{"clusterID":"rook-ceph","monitors":["10.43.98.167:6789","10.43.75.167:6789","10.43.59.5"],"namespace":""}]',
		data: 'c=10.43.98.167:6789,d=10.43.75.167:6789,b=10.43.59.5',
		mapping: '{"node":{"c":{"Name":"castor","Hostname":"castor","Address":"192.168.1.13"},"b":{"Name":"zeus","Hostname":"zeus","Address":"192.168.1.10"},"d":{"Name":"zeus","Hostname":"zeus","Address":"192.168.1.10"}}}',
		maxMonId: '4',
	},
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
