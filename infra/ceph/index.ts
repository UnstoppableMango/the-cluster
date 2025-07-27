import { DnsRecord, getZoneOutput } from '@pulumi/cloudflare';
import { CephBlockPool, CephFilesystem } from '@pulumi/crds/bin/ceph/v1';
import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { StorageClass } from '@pulumi/kubernetes/storage/v1';
import { Config, getStack, jsonStringify, StackReference } from '@pulumi/pulumi';
import z from 'zod/v4';

const Versions = z.object({
	ceph: z.string(),
	chart: z.string(),
	rook: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));
const clusterName = getStack();
const hostname = 'ceph.thecluster.lan';

const ns = Namespace.get('rook-ceph', 'rook-ceph');

const rookCephMonSecret = new Secret('rook-ceph-mon', {
	metadata: {
		name: 'rook-ceph-mon',
		namespace: ns.metadata.name,
		finalizers: ['ceph.rook.io/disaster-protection'],
	},
	type: 'kubernetes.io/rook',
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
		'csi-cluster-config-json': jsonStringify([{
			clusterID: 'rook-ceph',
			monitors: ['10.43.98.167:6789', '10.43.75.167:6789', '10.43.59.5:6789'],
			namespace: '',
			// Re-create what the operator seems to want
			cephFS: {
				fuseMountOptions: '',
				kernelMountOptions: '',
				netNamespaceFilePath: '',
				radosNamespace: '',
				subvolumeGroup: '',
			},
			nfs: { netNamespaceFilePath: '' },
			rbd: {
				mirrorDaemonCount: 0,
				netNamespaceFilePath: '',
				radosNamespace: '',
			},
			readAffinity: {
				crushLocationLabels: null,
				enabled: false,
			},
		}]),
		data: 'c=10.43.98.167:6789,d=10.43.75.167:6789,b=10.43.59.5:6789',
		mapping: jsonStringify({
			node: {
				c: {
					Name: 'castor',
					Hostname: 'castor',
					Address: '192.168.1.13',
				},
				b: {
					Name: 'zeus',
					Hostname: 'zeus',
					Address: '192.168.1.10',
				},
				d: {
					Name: 'zeus',
					Hostname: 'zeus',
					Address: '192.168.1.10',
				},
			},
		}),
		maxMonId: '4',
	},
});

const mgrPool = new CephBlockPool('mgr', {
	metadata: {
		name: 'mgr',
		namespace: ns.metadata.name,
	},
	spec: {
		name: '.mgr',
		deviceClass: 'hdd',
		failureDomain: 'osd',
		replicated: { size: 3 },
		parameters: {
			compression_mode: 'none',
		},
		mirroring: {
			enabled: false,
		},
	},
});

const originCaIssuer = new StackReference('origin-ca-issuer', {
	name: 'UnstoppableMango/thecluster-origin-ca-issuer/pinkdiamond',
});

const cloudflareZone = getZoneOutput({
	filter: { name: 'thecluster.io' },
});

const dashboardRecord = new DnsRecord('ceph', {
	name: hostname,
	ttl: 1,
	type: 'A',
	zoneId: cloudflareZone.zoneId?.apply(x => x ?? '') ?? '',
	content: config.requireSecret('public-ip'),
	proxied: false,
});

const chart = new Chart(clusterName, {
	chart: 'rook-ceph-cluster',
	repositoryOpts: {
		repo: 'https://charts.rook.io/release',
	},
	version: versions.chart,
	namespace: ns.metadata.name,
	values: {
		clusterName,
		operatorNamespace: ns.metadata.name,
		cephBlockPools: [],
		cephFileSystems: [],
		cephObjectStores: [
			{
				name: 'velero-default',
				spec: {
					metadataPool: {
						failureDomain: 'osd',
						replicated: { size: 3 },
						deviceClass: 'ssd',
					},
					dataPool: {
						failureDomain: 'osd',
						erasureCoded: {
							dataChunks: 2,
							codingChunks: 1,
						},
						deviceClass: 'hdd',
					},
					preservePoolsOnDelete: true,
					gateway: {
						instances: 1,
						resources: {
							limits: {
								memory: '1024Mi',
							},
							requests: {
								cpu: '500m',
								memory: '1024Mi',
							},
						},
					},
				},
				storageClass: {
					enabled: false,
				},
			}
		],
		cephClusterSpec: {
			cephVersion: {
				image: `quay.io/ceph/ceph:v${versions.ceph}`,
			},
			dataDirHostPath: '/var/lib/rook', // default value
			mon: {
				// https://github.com/rook/rook/blob/0a1dd5e9e619481432cc66347a45072178ca0b48/deploy/examples/cluster.yaml#L51-L52
				count: 3,
				allowMultiplePerNode: true,
			},
			mgr: {
				// https://github.com/rook/rook/blob/0a1dd5e9e619481432cc66347a45072178ca0b48/deploy/examples/cluster.yaml#L58-L60
				count: 2,
				allowMultiplePerNode: true,
			},
			storage: {
				useAllDevices: false,
				useAllNodes: false,
				nodes: [
					// { name: 'vrk8s1' },
					{
						name: 'gaea',
						devices: [
							{ name: 'sda1' },
							{ name: 'sdb1' },
							{ name: 'sdc1' },
							{ name: 'sdd1' },
							{ name: 'sde1' },
							{ name: 'sdf1' },
							{ name: 'sdg1' },
							{ name: 'sdh1' },
							{ name: 'sdi1' },
							{ name: 'sdj1' },
							{ name: 'sdk1' },
							{ name: 'sdl1' },
							{ name: 'sdm1' },
							{ name: 'sdn1' },
							{ name: 'sdo1' },
							{ name: 'sdp1' },
							{ name: 'sdq1' },
							{ name: 'sds1' },
							{ name: 'sdu1' },
						],
					},
					{
						name: 'zeus',
						devices: [
							{ name: 'sdb1' },
							{ name: 'sdc1' },
							{ name: 'sdd1' },
							{ name: 'sde1' },
							{ name: 'sdf1' },
							{ name: 'sdg1' },
							{ name: 'sdh1' },
							{ name: 'sdi1' },
							{ name: 'sdj1' },
							{ name: 'sdk1' },
							{ name: 'sdl1' },
							{ name: 'sdm1' },
							{ name: 'sdn1' },
							{ name: 'sdo1' },
						],
					},
					{
						name: 'castor',
					},
					{
						name: 'pollux',
					},
				],
			},
		},
		ingress: {
			dashboard: {
				enabled: true,
				annotations: {
					'cert-manager.io/issuer-group': 'cert-manager.io',
					'cert-manager.io/issuer-kind': 'ClusterIssuer',
					'cert-manager.io/issuer': 'thecluster.lan',
				},
				host: { name: hostname },
				tls: [{
					hosts: [hostname],
					secretName: 'rook-ceph-mgr-dashboard-tls',
				}],
				ingressClassName: 'nginx',
			},
		},
		toolbox: { enabled: true },
	},
}, { dependsOn: [rookCephMonSecret, rookCephMonEndpoints] });

const bulkPool = new CephBlockPool('bulk', {
	metadata: {
		name: 'bulk',
		namespace: ns.metadata.name,
	},
	spec: {
		deviceClass: 'hdd',
		failureDomain: 'osd',
		replicated: {
			size: 1,
			requireSafeReplicaSize: false,
		},
		parameters: { bulk: 'true' },
	},
}, {
	dependsOn: chart,
	protect: false,
});

const bulkClass = new StorageClass('bulk', {
	metadata: { name: 'bulk' },
	provisioner: 'rook-ceph.rbd.csi.ceph.com',
	parameters: {
		clusterID: 'rook-ceph',
		pool: 'bulk',
		imageFormat: '2',
		imageFeatures: 'layering',
		'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-rbd-node',
		'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
	},
	allowVolumeExpansion: true,
}, {
	dependsOn: [chart, bulkPool],
	protect: false,
});

const unsafePool = new CephBlockPool('unsafe-data', {
	metadata: {
		name: 'unsafe-data',
		namespace: ns.metadata.name,
	},
	spec: {
		deviceClass: 'hdd',
		failureDomain: 'osd',
		erasureCoded: {
			dataChunks: 2,
			codingChunks: 1,
		},
		parameters: { bulk: 'true' },
	},
}, {
	dependsOn: chart,
	protect: true,
});

const unsafeMetaPool = new CephBlockPool('unsafe-metadata', {
	metadata: {
		name: 'unsafe-metadata',
		namespace: ns.metadata.name,
	},
	spec: {
		deviceClass: 'hdd',
		failureDomain: 'osd',
		replicated: { size: 2 },
	},
}, {
	dependsOn: chart,
	protect: true,
});

const unsafeRbdClass = new StorageClass('unsafe-rbd', {
	metadata: { name: 'unsafe-rbd' },
	provisioner: 'rook-ceph.rbd.csi.ceph.com',
	parameters: {
		clusterID: 'rook-ceph',
		dataPool: 'unsafe-data',
		pool: 'unsafe-metadata',
		imageFormat: '2',
		imageFeatures: 'layering',
		'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-rbd-node',
		'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
	},
	reclaimPolicy: 'Retain',
	allowVolumeExpansion: true,
}, {
	dependsOn: [chart, unsafePool, unsafeMetaPool],
	protect: true,
});

const defaultPool = new CephBlockPool('default', {
	metadata: {
		name: 'default',
		namespace: ns.metadata.name,
	},
	spec: {
		deviceClass: 'hdd',
		failureDomain: 'host',
		replicated: { size: 2 },
		parameters: { bulk: 'true' },
	},
}, {
	dependsOn: chart,
	protect: true,
});

const rbdClass = new StorageClass('rbd', {
	metadata: { name: 'rbd' },
	provisioner: 'rook-ceph.rbd.csi.ceph.com',
	parameters: {
		clusterID: 'rook-ceph',
		pool: 'default',
		imageFormat: '2',
		imageFeatures: 'layering',
		'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-rbd-node',
		'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
	},
	allowVolumeExpansion: true,
}, {
	dependsOn: [chart, defaultPool],
	protect: true,
});

const defaultSsdPool = new CephBlockPool('default-ssd', {
	metadata: {
		name: 'default-ssd',
		namespace: ns.metadata.name,
	},
	spec: {
		deviceClass: 'ssd',
		failureDomain: 'host',
		replicated: {
			size: 1,
			requireSafeReplicaSize: false,
		},
	},
}, {
	dependsOn: chart,
	protect: true,
});

const ssdRbdClass = new StorageClass('ssd-rbd', {
	metadata: { name: 'ssd-rbd' },
	provisioner: 'rook-ceph.rbd.csi.ceph.com',
	parameters: {
		clusterID: 'rook-ceph',
		pool: 'default-ssd',
		imageFormat: '2',
		imageFeatures: 'layering',
		'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-rbd-provisioner',
		'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-rbd-node',
		'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
	},
	allowVolumeExpansion: true,
}, {
	dependsOn: [chart, defaultSsdPool],
	protect: true,
});

const replicatedCephfs = new CephFilesystem('replicated', {
	metadata: {
		name: 'replicated',
		namespace: ns.metadata.name,
	},
	spec: {
		metadataPool: {
			deviceClass: 'hdd',
			replicated: { size: 2 },
		},
		dataPools: [
			{
				name: 'data',
				deviceClass: 'hdd',
				failureDomain: 'osd',
				replicated: { size: 2 },
				parameters: { bulk: 'true' },
			},
		],
		preserveFilesystemOnDelete: true,
		metadataServer: {
			activeCount: 1,
			activeStandby: true,
		},
	},
}, {
	dependsOn: chart,
	protect: true,
});

const defaultCephfsClass = new StorageClass('default-cephfs', {
	metadata: { name: 'default-cephfs' },
	provisioner: 'rook-ceph.cephfs.csi.ceph.com',
	parameters: {
		clusterID: 'rook-ceph',
		fsName: 'replicated',
		pool: 'replicated-data',
		'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-cephfs-provisioner',
		'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-cephfs-provisioner',
		'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-cephfs-node',
		'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
	},
	reclaimPolicy: 'Retain',
	allowVolumeExpansion: true,
}, {
	dependsOn: [chart, replicatedCephfs],
	protect: true,
});

const erasureCodedCephfs = new CephFilesystem('erasure-coded', {
	metadata: {
		name: 'erasure-coded',
		namespace: ns.metadata.name,
	},
	spec: {
		metadataPool: {
			deviceClass: 'ssd',
			replicated: { size: 2 },
		},
		dataPools: [
			{
				name: 'default',
				deviceClass: 'hdd',
				failureDomain: 'osd',
				replicated: { size: 2 },
			},
			{
				name: 'data',
				deviceClass: 'hdd',
				failureDomain: 'osd',
				erasureCoded: {
					dataChunks: 2,
					codingChunks: 1,
				},
			},
		],
		preserveFilesystemOnDelete: true,
		metadataServer: {
			activeCount: 1,
			activeStandby: true,
		},
	},
}, {
	dependsOn: chart,
	protect: false,
});

const ecCephfsClass = new StorageClass('ec-cephfs', {
	metadata: { name: 'ec-cephfs' },
	provisioner: 'rook-ceph.cephfs.csi.ceph.com',
	parameters: {
		clusterID: 'rook-ceph',
		fsName: 'erasure-coded',
		pool: 'erasure-coded-data',
		'csi.storage.k8s.io/provisioner-secret-name': 'rook-csi-cephfs-provisioner',
		'csi.storage.k8s.io/provisioner-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/controller-expand-secret-name': 'rook-csi-cephfs-provisioner',
		'csi.storage.k8s.io/controller-expand-secret-namespace': 'rook-ceph',
		'csi.storage.k8s.io/node-stage-secret-name': 'rook-csi-cephfs-node',
		'csi.storage.k8s.io/node-stage-secret-namespace': 'rook-ceph',
	},
	reclaimPolicy: 'Delete',
	allowVolumeExpansion: true,
}, {
	dependsOn: [chart, erasureCodedCephfs],
	protect: false,
});

export const storageClasses = [
	unsafeRbdClass.metadata.name,
	defaultCephfsClass.metadata.name,
	// ecCephfsClass.metadata.name,
	rbdClass.metadata.name,
];
