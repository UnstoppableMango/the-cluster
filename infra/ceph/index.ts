import { Deployment } from '@pulumi/kubernetes/apps/v1';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Ingress } from '@pulumi/kubernetes/networking/v1';
import { StorageClass } from '@pulumi/kubernetes/storage/v1';
import { clusterName, versions } from './config';
import * as crds from './crds/ceph/v1';

const ns = Namespace.get('rook-ceph', 'rook-ceph');

const cluster = new crds.CephCluster(clusterName, {
	metadata: {
		name: clusterName,
		namespace: ns.metadata.name,
	},
	spec: {
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
		dashboard: {
			enabled: true,
			ssl: false,
		},
		resources: {
			mon: {
				requests: {
					memory: '1Gi',
				},
				limits: {
					memory: '1Gi',
				},
			},
			mgr: {
				requests: {
					memory: '512Mi',
				},
				limits: {
					memory: '1Gi',
				},
			},
			osd: {
				requests: {
					memory: '4Gi',
				},
				limits: {
					memory: '4Gi',
				},
			},
			crashcollector: {
				requests: {
					memory: '60Mi',
				},
				limits: {
					memory: '60Mi',
				},
			},
			'mgr-sidecar': {
				requests: {
					memory: '40Mi',
				},
				limits: {
					memory: '100Mi',
				},
			},
			exporter: {
				requests: {
					memory: '50Mi',
				},
				limits: {
					memory: '128Mi',
				},
			},
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
}, { protect: true });

const ingress = new Ingress('dashboard', {
	metadata: {
		name: 'rook-ceph-dashboard',
		namespace: ns.metadata.name,
		annotations: {
			'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
			'pulumi.com/skipAwait': 'true',
		},
	},
	spec: {
		ingressClassName: 'thecluster-io',
		rules: [{
			host: 'ceph.thecluster.io',
			http: {
				paths: [{
					pathType: 'Prefix',
					path: '/',
					backend: {
						service: {
							name: 'rook-ceph-mgr-dashboard',
							port: {
								number: 7000,
							},
						},
					},
				}],
			},
		}],
	},
});

const mgrPool = new crds.CephBlockPool('mgr', {
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
}, { protect: true });

const bulkPool = new crds.CephBlockPool('bulk', {
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
	dependsOn: cluster,
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
	dependsOn: [cluster, bulkPool],
	protect: false,
});

const unsafePool = new crds.CephBlockPool('unsafe-data', {
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
	dependsOn: cluster,
	protect: true,
});

const unsafeMetaPool = new crds.CephBlockPool('unsafe-metadata', {
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
	dependsOn: cluster,
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
	dependsOn: [cluster, unsafePool, unsafeMetaPool],
	protect: true,
});

const defaultPool = new crds.CephBlockPool('default', {
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
	dependsOn: cluster,
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
	dependsOn: [cluster, defaultPool],
	protect: true,
});

const defaultSsdPool = new crds.CephBlockPool('default-ssd', {
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
	dependsOn: cluster,
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
	dependsOn: [cluster, defaultSsdPool],
	protect: true,
});

const replicatedCephfs = new crds.CephFilesystem('replicated', {
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
	dependsOn: cluster,
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
	dependsOn: [cluster, replicatedCephfs],
	protect: true,
});

const erasureCodedCephfs = new crds.CephFilesystem('erasure-coded', {
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
	dependsOn: cluster,
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
	dependsOn: [cluster, erasureCodedCephfs],
	protect: false,
});

export const storageClasses = [
	unsafeRbdClass.metadata.name,
	defaultCephfsClass.metadata.name,
	// ecCephfsClass.metadata.name,
	rbdClass.metadata.name,
];

// https://github.com/rook/rook/blob/master/deploy/examples/toolbox.yaml
const toolbox = new Deployment('toolbox', {
	metadata: {
		name: 'rook-ceph-toolbox',
		namespace: ns.metadata.name,
	},
	spec: {
		replicas: 1,
		selector: {
			matchLabels: {
				app: 'rook-ceph-tools',
			},
		},
		template: {
			metadata: {
				labels: {
					app: 'rook-ceph-tools',
				},
			},
			spec: {
				dnsPolicy: 'ClusterFirstWithHostNet',
				serviceAccountName: 'rook-ceph-default',
				containers: [{
					name: 'rook-ceph-tools',
					image: `quay.io/ceph/ceph:v${versions.ceph}`,
					command: [
						'/bin/bash',
						'-c',
						toolboxScript(versions.rook),
					],
					imagePullPolicy: 'IfNotPresent',
					tty: true,
					securityContext: {
						runAsNonRoot: true,
						runAsUser: 2016,
						runAsGroup: 2016,
						capabilities: {
							drop: ['ALL'],
						},
					},
					env: [{
						name: 'ROOK_CEPH_USERNAME',
						valueFrom: {
							secretKeyRef: {
								name: 'rook-ceph-mon',
								key: 'ceph-username',
							},
						},
					}],
					volumeMounts: [
						{ name: 'ceph-config', mountPath: '/etc/ceph' },
						{ name: 'mon-endpoint-volume', mountPath: '/etc/rook' },
						{ name: 'ceph-admin-secret', mountPath: '/var/lib/rook-ceph-mon', readOnly: true },
					],
				}],
				volumes: [
					{
						name: 'ceph-admin-secret',
						secret: {
							secretName: 'rook-ceph-mon',
							optional: false,
							items: [
								{ key: 'ceph-secret', path: 'secret.keyring' },
							],
						},
					},
					{
						name: 'mon-endpoint-volume',
						configMap: {
							name: 'rook-ceph-mon-endpoints',
							items: [
								{ key: 'data', path: 'mon-endpoints' },
							],
						},
					},
					{ name: 'ceph-config', emptyDir: {} },
				],
				tolerations: [{
					key: 'node.kubernetes.io/unreachable',
					operator: 'Exists',
					effect: 'NoExecute',
					tolerationSeconds: 5,
				}],
			},
		},
	},
}, { dependsOn: [cluster] });

function toolboxScript(version: string): Promise<string> {
	const baseUrl = 'https://raw.githubusercontent.com';
	const script = 'images/ceph/toolbox.sh';
	const url = `${baseUrl}/rook/rook/refs/tags/v${version}/${script}`;

	return fetch(url).then(x => x.text());
}
