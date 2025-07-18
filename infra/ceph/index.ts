import { CephBlockPool, CephFilesystem } from '@pulumi/crds/bin/ceph/v1';
import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { StorageClass } from '@pulumi/kubernetes/storage/v1';
import { Config, getStack } from '@pulumi/pulumi';
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
		'csi-cluster-config-json':
			'[{"clusterID":"rook-ceph","monitors":["10.43.98.167:6789","10.43.75.167:6789","10.43.59.5"],"namespace":""}]',
		data: 'c=10.43.98.167:6789,d=10.43.75.167:6789,b=10.43.59.5',
		mapping:
			'{"node":{"c":{"Name":"castor","Hostname":"castor","Address":"192.168.1.13"},"b":{"Name":"zeus","Hostname":"zeus","Address":"192.168.1.10"},"d":{"Name":"zeus","Hostname":"zeus","Address":"192.168.1.10"}}}',
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
		cephObjectStores: [],
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
			dashboard: {},
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

// https://github.com/rook/rook/blob/master/deploy/examples/toolbox.yaml
// const toolbox = new Deployment('toolbox', {
// 	metadata: {
// 		name: 'rook-ceph-toolbox',
// 		namespace: ns.metadata.name,
// 	},
// 	spec: {
// 		replicas: 1,
// 		selector: {
// 			matchLabels: {
// 				app: 'rook-ceph-tools',
// 			},
// 		},
// 		template: {
// 			metadata: {
// 				labels: {
// 					app: 'rook-ceph-tools',
// 				},
// 			},
// 			spec: {
// 				dnsPolicy: 'ClusterFirstWithHostNet',
// 				serviceAccountName: 'rook-ceph-default',
// 				containers: [{
// 					name: 'rook-ceph-tools',
// 					image: `quay.io/ceph/ceph:v${versions.ceph}`,
// 					command: [
// 						'/bin/bash',
// 						'-c',
// 						toolboxScript(versions.rook),
// 					],
// 					imagePullPolicy: 'IfNotPresent',
// 					tty: true,
// 					securityContext: {
// 						runAsNonRoot: true,
// 						runAsUser: 2016,
// 						runAsGroup: 2016,
// 						capabilities: {
// 							drop: ['ALL'],
// 						},
// 					},
// 					env: [{
// 						name: 'ROOK_CEPH_USERNAME',
// 						valueFrom: {
// 							secretKeyRef: {
// 								name: 'rook-ceph-mon',
// 								key: 'ceph-username',
// 							},
// 						},
// 					}],
// 					volumeMounts: [
// 						{ name: 'ceph-config', mountPath: '/etc/ceph' },
// 						{ name: 'mon-endpoint-volume', mountPath: '/etc/rook' },
// 						{ name: 'ceph-admin-secret', mountPath: '/var/lib/rook-ceph-mon', readOnly: true },
// 					],
// 				}],
// 				volumes: [
// 					{
// 						name: 'ceph-admin-secret',
// 						secret: {
// 							secretName: 'rook-ceph-mon',
// 							optional: false,
// 							items: [
// 								{ key: 'ceph-secret', path: 'secret.keyring' },
// 							],
// 						},
// 					},
// 					{
// 						name: 'mon-endpoint-volume',
// 						configMap: {
// 							name: 'rook-ceph-mon-endpoints',
// 							items: [
// 								{ key: 'data', path: 'mon-endpoints' },
// 							],
// 						},
// 					},
// 					{ name: 'ceph-config', emptyDir: {} },
// 				],
// 				tolerations: [{
// 					key: 'node.kubernetes.io/unreachable',
// 					operator: 'Exists',
// 					effect: 'NoExecute',
// 					tolerationSeconds: 5,
// 				}],
// 			},
// 		},
// 	},
// }, { dependsOn: [chart] });

// function toolboxScript(version: string): Promise<string> {
// 	const baseUrl = 'https://raw.githubusercontent.com';
// 	const script = 'images/ceph/toolbox.sh';
// 	const url = `${baseUrl}/rook/rook/refs/tags/v${version}/${script}`;

// 	return fetch(url).then(x => x.text());
// }
