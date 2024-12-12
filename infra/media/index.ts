import { Job } from '@pulumi/kubernetes/batch/v1';
import { Namespace, PersistentVolumeClaim } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('media', {
  metadata: { name: 'media' },
});

const movies = new PersistentVolumeClaim('movies', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'ec-cephfs',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '20Ti',
      },
    },
  },
}, { protect: true });

const movies4k = new PersistentVolumeClaim('movies4k', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'ec-cephfs',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '5Ti',
      },
    },
  },
}, { protect: true });

const tv = new PersistentVolumeClaim('tv', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'ec-cephfs',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '20Ti',
      },
    },
  },
}, { protect: true });

const tv4k = new PersistentVolumeClaim('tv4k', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'ec-cephfs',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '10Ti',
      },
    },
  },
}, { protect: true });

const anime = new PersistentVolumeClaim('anime', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'default-cephfs',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '10Ti',
      },
    },
  },
}, { protect: true });

const music = new PersistentVolumeClaim('music', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'default-cephfs',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '5Ti',
      },
    },
  },
}, { protect: true });

const rsyncScript: string = `
#!/bin/bash

export DEBIAN_FRONTEND=noninteractive
apt-get update && apt upgrade -y
apt-get install -y rsync
rsync -avuhp --info=progress2 /mnt/src/ /mnt/dst
`;

const moviesRsync = new Job('movies', {
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
              claimName: movies.metadata.name,
            },
          },
          {
            name: 'src',
            nfs: {
              server: '192.168.1.11',
              path: '/tank2/media/movies',
            },
          },
        ],
      },
    },
  },
}, { dependsOn: movies });

const tvRsync = new Job('tv', {
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
              claimName: tv.metadata.name,
            },
          },
          {
            name: 'src',
            nfs: {
              server: '192.168.1.11',
              path: '/tank1/media/tv',
            },
          },
        ],
      },
    },
  },
}, { dependsOn: movies });

// const ingress = new Ingress('media', {
//   metadata: {
//     name: 'media',
//     namespace: shared.namespaces.media,
//     annotations: {
//       'nginx.org/websocket-services': apps.deemix.service,
//       'cert-manager.io/cluster-issuer': clusterIssuers.root,
//       'external-dns.alpha.kubernetes.io/hostname': [
//         hosts.internal,
//         // ...hosts.aliases.internal,
//       ].join(','),
//     },
//   },
//   spec: {
//     ingressClassName: ingresses.internal,
//     rules: [
//       {
//         host: hosts.internal,
//         http: {
//           paths: [
//             {
//               path: '/deemix',
//               pathType: 'ImplementationSpecific',
//               backend: {
//                 service: {
//                   name: apps.deemix.service,
//                   port: {
//                     name: 'http',
//                   },
//                 },
//               },
//             },
//             {
//               path: '/',
//               pathType: 'ImplementationSpecific',
//               backend: {
//                 service: {
//                   name: apps.filebrowser.service,
//                   port: {
//                     name: 'http',
//                   },
//                 },
//               },
//             },
//           ],
//         },
//       },
//       {
//         host: 'deemix.lan.thecluster.io',
//         http: {
//           paths: [{
//             pathType: 'ImplementationSpecific',
//             backend: {
//               service: {
//                 name: apps.deemix.service,
//                 port: {
//                   name: 'http',
//                 },
//               },
//             },
//           }],
//         },
//       },
//       {
//         host: 'plex.lan.thecluster.io',
//         http: {
//           paths: [{
//             pathType: 'ImplementationSpecific',
//             backend: {
//               service: {
//                 name: apps.plex.service,
//                 port: {
//                   name: 'http',
//                 },
//               },
//             },
//           }],
//         },
//       },
//     ],
//     tls: [
//       {
//         hosts: [hosts.internal],
//         secretName: 'media-certs',
//       },
//       {
//         hosts: ['deemix.lan.thecluster.io'],
//         secretName: 'deemix-certs',
//       }
//     ],
//   },
// }, { provider });
