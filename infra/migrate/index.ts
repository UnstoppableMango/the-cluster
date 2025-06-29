import { Deployment } from '@pulumi/kubernetes/apps/v1';
import { Job } from '@pulumi/kubernetes/batch/v1';
import { Namespace, PersistentVolumeClaim, Pod } from '@pulumi/kubernetes/core/v1';
import { clusterName, provider, versions } from './config';

const ns = new Namespace('migrate', {
	metadata: { name: 'migrate' },
}, { provider });

const isosClaim = new PersistentVolumeClaim('isos', {
	metadata: {
		name: 'isos',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '7Ti',
			},
		},
	},
}, { provider });

const animeClaim = new PersistentVolumeClaim('anime', {
	metadata: {
		name: 'anime',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '10Ti',
			},
		},
	},
}, { provider });

const moviesClaim = new PersistentVolumeClaim('movies', {
	metadata: {
		name: 'movies',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '12Ti',
			},
		},
	},
}, { provider });

const movies4kClaim = new PersistentVolumeClaim('movies4k', {
	metadata: {
		name: 'movies4k',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '4Ti',
			},
		},
	},
}, { provider });

const tvClaim = new PersistentVolumeClaim('tv', {
	metadata: {
		name: 'tv',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '12Ti',
			},
		},
	},
}, { provider });

const tv4kClaim = new PersistentVolumeClaim('tv4k', {
	metadata: {
		name: 'tv4k',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '10Ti',
			},
		},
	},
}, { provider });

const musicClaim = new PersistentVolumeClaim('music', {
	metadata: {
		name: 'music',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '4Ti',
			},
		},
	},
}, { provider });

const photosClaim = new PersistentVolumeClaim('photos', {
	metadata: {
		name: 'photos',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '2Ti',
			},
		},
	},
}, { provider });

const archiveClaim = new PersistentVolumeClaim('archive', {
	metadata: {
		name: 'archive',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '3Ti',
			},
		},
	},
}, { provider });

const downloadsClaim = new PersistentVolumeClaim('downloads', {
	metadata: {
		name: 'downloads',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '6Ti',
			},
		},
	},
}, { provider });

const backupClaim = new PersistentVolumeClaim('backup', {
	metadata: {
		name: 'backup',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '8Ti',
			},
		},
	},
}, { provider });

const linuxIsosClaim = new PersistentVolumeClaim('linux-isos', {
	metadata: {
		name: 'linux-isos',
		namespace: ns.metadata.name,
	},
	spec: {
		storageClassName: 'unsafe-rbd',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '1Ti',
			},
		},
	},
}, { provider });

const test = new Pod('mounty', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		containers: [{
			name: 'shell',
			image: 'ubuntu',
			command: ['bash', '-c', '--'],
			args: ['while true; do sleep 30; done;'],
			volumeMounts: [
				{ name: 'linux-isos', mountPath: '/mnt/linux-isos' },
				{ name: 'photos', mountPath: '/mnt/photos' },
				{ name: 'download', mountPath: '/mnt/download' },
				{ name: 'archive', mountPath: '/mnt/archive' },
				{ name: 'backup', mountPath: '/mnt/bakcup' },
				{ name: 'movies4k', mountPath: '/mnt/movies4k' },
				{ name: 'movies', mountPath: '/mnt/movies' },
				{ name: 'tv4k', mountPath: '/mnt/tv4k' },
				{ name: 'tv', mountPath: '/mnt/tv' },
				{ name: 'anime', mountPath: '/mnt/anime' },
				{ name: 'music', mountPath: '/mnt/music' },
			],
		}],
		volumes: [
			{
				name: 'isos',
				persistentVolumeClaim: {
					claimName: isosClaim.metadata.name,
				},
			},
			{
				name: 'anime',
				persistentVolumeClaim: {
					claimName: animeClaim.metadata.name,
				},
			},
			{
				name: 'tv',
				persistentVolumeClaim: {
					claimName: tvClaim.metadata.name,
				},
			},
			{
				name: 'tv4k',
				persistentVolumeClaim: {
					claimName: tv4kClaim.metadata.name,
				},
			},
			{
				name: 'movies',
				persistentVolumeClaim: {
					claimName: moviesClaim.metadata.name,
				},
			},
			{
				name: 'movies4k',
				persistentVolumeClaim: {
					claimName: movies4kClaim.metadata.name,
				},
			},
			{
				name: 'music',
				persistentVolumeClaim: {
					claimName: musicClaim.metadata.name,
				},
			},
			{
				name: 'photos',
				persistentVolumeClaim: {
					claimName: photosClaim.metadata.name,
				},
			},
			{
				name: 'linux-isos',
				persistentVolumeClaim: {
					claimName: linuxIsosClaim.metadata.name,
				},
			},
			{
				name: 'download',
				persistentVolumeClaim: {
					claimName: downloadsClaim.metadata.name,
				},
			},
			{
				name: 'archive',
				persistentVolumeClaim: {
					claimName: archiveClaim.metadata.name,
				},
			},
			{
				name: 'backup',
				persistentVolumeClaim: {
					claimName: backupClaim.metadata.name,
				},
			},
		],
	},
});

// const toolbox = new Deployment('ubuntu', {
//   metadata: {
//     name: 'ubuntu',
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     replicas: 1,
//     strategy: {
//       type: 'Recreate',
//     },
//     selector: {
//       matchLabels: {
//         app: 'thecluster-migrate',
//       },
//     },
//     template: {
//       metadata: {
//         labels: {
//           app: 'thecluster-migrate',
//         },
//       },
//       spec: {
//         affinity: {
//           nodeAffinity: {
//             requiredDuringSchedulingIgnoredDuringExecution: {
//               nodeSelectorTerms: [{
//                 matchExpressions: [{
//                   key: 'kubernetes.io/hostname',
//                   operator: 'In',
//                   values: ['gaea'],
//                 }]
//               }],
//             },
//           },
//         },
//         // serviceAccountName: 'thecluster-migrate',
//         containers: [{
//           name: 'thecluster-migrate',
//           image: `ubuntu:noble-20240904.1`,
//           imagePullPolicy: 'IfNotPresent',
//           tty: true,
//           // securityContext: {
//           //   runAsNonRoot: true,
//           //   runAsUser: 1001,
//           //   runAsGroup: 1001,
//           //   capabilities: {
//           //     drop: ['ALL'],
//           //   },
//           // },
//           volumeMounts: [
//             // { name: 'isos-ceph', mountPath: '/var/thecluster/isos' },
//             // { name: 'movies-ceph', mountPath: '/var/thecluster/movies' },
//             // { name: 'movies4k-ceph', mountPath: '/var/thecluster/movies4k' },
//             // { name: 'tv-ceph', mountPath: '/var/thecluster/tv' },
//             // { name: 'tv4k-ceph', mountPath: '/var/thecluster/tv4k' },
//             // { name: 'music-ceph', mountPath: '/var/thecluster/music' },
//             // { name: 'photos-ceph', mountPath: '/var/thecluster/photos' },
//             // { name: 'isos', mountPath: '/mnt/isos' },
//             // { name: 'media', mountPath: '/mnt/media' },
//           ],
//         }],
//         volumes: [
//           // {
//           //   name: 'isos-ceph',
//           //   persistentVolumeClaim: {
//           //     claimName: isosClaim.metadata.name,
//           //   },
//           // },
//           // {
//           //   name: 'movies-ceph',
//           //   persistentVolumeClaim: {
//           //     claimName: moviesClaim.metadata.name,
//           //   },
//           // },
//           // {
//           //   name: 'movies4k-ceph',
//           //   persistentVolumeClaim: {
//           //     claimName: movies4kClaim.metadata.name,
//           //   },
//           // },
//           // {
//           //   name: 'tv-ceph',
//           //   persistentVolumeClaim: {
//           //     claimName: tvClaim.metadata.name,
//           //   },
//           // },
//           // {
//           //   name: 'tv4k-ceph',
//           //   persistentVolumeClaim: {
//           //     claimName: tv4kClaim.metadata.name,
//           //   },
//           // },
//           // {
//           //   name: 'music-ceph',
//           //   persistentVolumeClaim: {
//           //     claimName: musicClaim.metadata.name,
//           //   },
//           // },
//           // {
//           //   name: 'photos-ceph',
//           //   persistentVolumeClaim: {
//           //     claimName: photosClaim.metadata.name,
//           //   },
//           // },
//           // {
//           //   name: 'isos',
//           //   nfs: {
//           //     server: '192.168.1.10',
//           //     path: '/tank1/media/isos',
//           //   },
//           // },
//           // {
//           //   name: 'media',
//           //   nfs: {
//           //     server: '192.168.1.10',
//           //     path: '/tank1/media',
//           //   },
//           // },
//         ],
//       },
//     },
//   },
// }, { provider });

const rsyncScript: string = `
#!/bin/bash

export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y
apt install -y rsync
rsync -avuhp --info=progress2 /mnt/src /mnt/dst
`;

// const backupRsync = new Job('backup', {
//   metadata: {
//     namespace: ns.metadata.name,
//     annotations: {
//       'pulumi.com/skipAwait': 'true',
//     },
//   },
//   spec: {
//     template: {
//       spec: {
//         restartPolicy: 'Never',
//         containers: [{
//           name: 'rsync',
//           image: `ubuntu:noble-20240904.1`,
//           command: ['bash', '-c', rsyncScript],
//           volumeMounts: [
//             { name: 'src', mountPath: '/mnt/src' },
//             { name: 'dst', mountPath: '/mnt/dst', subPath: 'thecluster-vms' },
//           ],
//         }],
//         volumes: [
//           {
//             name: 'dst',
//             persistentVolumeClaim: {
//               claimName: backupClaim.metadata.name,
//             },
//           },
//           {
//             name: 'src',
//             nfs: {
//               server: '192.168.1.10',
//               path: '/tank1/backup/thecluster-vms',
//             },
//           },
//         ],
//       },
//     },
//   },
// }, {
//   provider,
//   dependsOn: backupClaim,
// });
