import { clusterName, provider, versions } from './config';
import { Deployment } from '@pulumi/kubernetes/apps/v1';
import { Job } from '@pulumi/kubernetes/batch/v1';
import { Namespace, PersistentVolumeClaim } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('migrate', {
  metadata: { name: 'migrate' },
}, { provider });

const isosClaim = new PersistentVolumeClaim('isos', {
  metadata: {
    name: 'isos',
    namespace: ns.metadata.name,
  },
  spec: {
    storageClassName: 'erasure-rbd',
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
    storageClassName: 'erasure-rbd',
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
    storageClassName: 'erasure-rbd',
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
    storageClassName: 'erasure-rbd',
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
    storageClassName: 'erasure-rbd',
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
    storageClassName: 'erasure-rbd',
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
    storageClassName: 'erasure-rbd',
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
    storageClassName: 'erasure-rbd',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '2Ti',
      },
    },
  },
}, { provider });

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

const isosRsync = new Job('isos', {
  metadata: {
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [{
          name: 'rsync',
          image: `ubuntu:noble-20240904.1`,
          command: ['bash', '-c', rsyncScript],
          volumeMounts: [
            { name: 'isos', mountPath: '/mnt/src' },
            { name: 'isos-ceph', mountPath: '/mnt/dst' },
          ],
        }],
        volumes: [
          {
            name: 'isos-ceph',
            persistentVolumeClaim: {
              claimName: isosClaim.metadata.name,
            },
          },
          {
            name: 'isos',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media/isos',
            },
          },
        ],
      },
    },
  },
}, {
  provider,
  dependsOn: isosClaim,
});

const animeRsync = new Job('anime', {
  metadata: {
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [{
          name: 'rsync',
          image: `ubuntu:noble-20240904.1`,
          command: ['bash', '-c', rsyncScript],
          volumeMounts: [
            { name: 'src', mountPath: '/mnt/src' },
            { name: 'dst', mountPath: '/mnt/dst' },
          ],
        }],
        volumes: [
          {
            name: 'dst',
            persistentVolumeClaim: {
              claimName: animeClaim.metadata.name,
            },
          },
          {
            name: 'src',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media/anime',
            },
          },
        ],
      },
    },
  },
}, {
  provider,
  dependsOn: animeClaim,
});

const movies4kRsync = new Job('movies4k', {
  metadata: {
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [{
          name: 'rsync',
          image: `ubuntu:noble-20240904.1`,
          command: ['bash', '-c', rsyncScript],
          volumeMounts: [
            { name: 'src', mountPath: '/mnt/src' },
            { name: 'dst', mountPath: '/mnt/dst' },
          ],
        }],
        volumes: [
          {
            name: 'dst',
            persistentVolumeClaim: {
              claimName: movies4kClaim.metadata.name,
            },
          },
          {
            name: 'src',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media/movies4k',
            },
          },
        ],
      },
    },
  },
}, {
  provider,
  dependsOn: movies4kClaim,
});

const musicRsync = new Job('music', {
  metadata: {
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [{
          name: 'rsync',
          image: `ubuntu:noble-20240904.1`,
          command: ['bash', '-c', rsyncScript],
          volumeMounts: [
            { name: 'src', mountPath: '/mnt/src' },
            { name: 'dst', mountPath: '/mnt/dst' },
          ],
        }],
        volumes: [
          {
            name: 'dst',
            persistentVolumeClaim: {
              claimName: musicClaim.metadata.name,
            },
          },
          {
            name: 'src',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media/music',
            },
          },
        ],
      },
    },
  },
}, {
  provider,
  dependsOn: movies4kClaim,
});

const photosRsync = new Job('photos', {
  metadata: {
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [{
          name: 'rsync',
          image: `ubuntu:noble-20240904.1`,
          command: ['bash', '-c', rsyncScript],
          volumeMounts: [
            { name: 'src', mountPath: '/mnt/src' },
            { name: 'dst', mountPath: '/mnt/dst' },
          ],
        }],
        volumes: [
          {
            name: 'dst',
            persistentVolumeClaim: {
              claimName: photosClaim.metadata.name,
            },
          },
          {
            name: 'src',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media/photos',
            },
          },
        ],
      },
    },
  },
}, {
  provider,
  dependsOn: photosClaim,
});

const tv4kRsync = new Job('tv4k', {
  metadata: {
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        restartPolicy: 'Never',
        containers: [{
          name: 'rsync',
          image: `ubuntu:noble-20240904.1`,
          command: ['bash', '-c', rsyncScript],
          volumeMounts: [
            { name: 'src', mountPath: '/mnt/src' },
            { name: 'dst', mountPath: '/mnt/dst' },
          ],
        }],
        volumes: [
          {
            name: 'dst',
            persistentVolumeClaim: {
              claimName: tv4kClaim.metadata.name,
            },
          },
          {
            name: 'src',
            nfs: {
              server: '192.168.1.10',
              path: '/tank1/media/tv4k',
            },
          },
        ],
      },
    },
  },
}, {
  provider,
  dependsOn: tv4kClaim,
});
