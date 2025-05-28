import { Job } from '@pulumi/kubernetes/batch/v1';
import { Namespace, PersistentVolumeClaim, Pod, Secret } from '@pulumi/kubernetes/core/v1';
import { Wireguard, WireguardPeer } from './crds/nodejs/vpn/v1alpha1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config } from '@pulumi/pulumi';

const ns = new Namespace('media', {
  metadata: { name: 'media' },
});

const moviesTmp = new PersistentVolumeClaim('movies-tmp', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'bulk',
    accessModes: ['ReadWriteOncePod'],
    resources: {
      requests: {
        storage: '20Ti',
      },
    },
  },
}, { protect: false });

const movies = new PersistentVolumeClaim('movies', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'ec-cephfs',
    accessModes: ['ReadWriteMany'],
    resources: {
      requests: {
        storage: '20Ti',
      },
    },
  },
}, { protect: false });

// const movies4k = new PersistentVolumeClaim('movies4k', {
//   metadata: { namespace: ns.metadata.name },
//   spec: {
//     storageClassName: 'ec-cephfs',
//     accessModes: ['ReadWriteOnce'],
//     resources: {
//       requests: {
//         storage: '5Ti',
//       },
//     },
//   },
// }, { protect: false });

const tvTmp = new PersistentVolumeClaim('tv-tmp', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'bulk',
    accessModes: ['ReadWriteOncePod'],
    resources: {
      requests: {
        storage: '20Ti',
      },
    },
  },
}, { protect: false });

const tv = new PersistentVolumeClaim('tv', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'ec-cephfs',
    accessModes: ['ReadWriteMany'],
    resources: {
      requests: {
        storage: '20Ti',
      },
    },
  },
}, { protect: false });

// const tv4k = new PersistentVolumeClaim('tv4k', {
//   metadata: { namespace: ns.metadata.name },
//   spec: {
//     storageClassName: 'ec-cephfs',
//     accessModes: ['ReadWriteOnce'],
//     resources: {
//       requests: {
//         storage: '10Ti',
//       },
//     },
//   },
// }, { protect: false });

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

const plexConfig = new PersistentVolumeClaim('plex-config', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    storageClassName: 'ssd-rbd',
    accessModes: ['ReadWriteOncePod'],
    resources: {
      requests: {
        storage: '500Gi',
      },
    },
  },
});

// const test = new Pod('mounty', {
//   metadata: { namespace: ns.metadata.name },
//   spec: {
//     containers: [{
//       name: 'shell',
//       image: 'ubuntu',
//       command: ['bash', '-c', '--'],
//       args: ['while true; do sleep 30; done;'],
//       volumeMounts: [
//         // { name: 'movies', mountPath: '/mnt/movies' },
//         // { name: 'tv', mountPath: '/mnt/tv' },
//         { name: 'anime', mountPath: '/mnt/anime' },
//         { name: 'music', mountPath: '/mnt/music' },
//         { name: 'plex', mountPath: '/mnt/plex' },
//       ],
//     }],
//     volumes: [
//       // {
//       //   name: 'movies',
//       //   persistentVolumeClaim: {
//       //     claimName: moviesTmp.metadata.name,
//       //   },
//       // },
//       // {
//       //   name: 'tv',
//       //   persistentVolumeClaim: {
//       //     claimName: tvTmp.metadata.name,
//       //   },
//       // },
//       // {
//       //   name: 'anime',
//       //   persistentVolumeClaim: {
//       //     claimName: anime.metadata.name,
//       //   },
//       // },
//       // {
//       //   name: 'music',
//       //   persistentVolumeClaim: {
//       //     claimName: music.metadata.name,
//       //   },
//       // },
//       // {
//       //   name: 'plex',
//       //   persistentVolumeClaim: {
//       //     claimName: plexConfig.metadata.name,
//       //   },
//       // },
//     ],
//   },
// });

const config = new Config();

const plexSecret = new Secret('plex', {
  metadata: { namespace: ns.metadata.name },
  stringData: {
    claim: config.requireSecret('plexClaim'),
  },
});

const plex = new Chart('plex', {
  chart: 'plex-media-server',
  repositoryOpts: {
    repo: 'https://raw.githubusercontent.com/plexinc/pms-docker/gh-pages',
  },
  name: 'plex',
  namespace: ns.metadata.name,
  values: {
    pms: {
      configExistingClaim: plexConfig.metadata.name,
      claimSecret: {
        name: plexSecret.metadata.name,
        key: 'claim',
        // I think this is a bug in the chart
        // https://github.com/plexinc/pms-docker/blob/master/charts/plex-media-server/templates/statefulset.yaml
        value: 'blah',
      },
      resources: {
        limits: {
          cpu: '16',
          memory: '32Gi'
        },
        requests: {
          cpu: '4',
          memory: '4Gi',
        },
      },
    },
    service: {
      type: 'LoadBalancer',
    },
    extraVolumeMounts: [
      { name: 'movies', mountPath: '/mnt/movies' },
      { name: 'tv', mountPath: '/mnt/tv' },
      { name: 'anime', mountPath: '/mnt/anime' },
      { name: 'music', mountPath: '/mnt/music' },
    ],
    extraVolumes: [
      {
        name: 'movies',
        persistentVolumeClaim: {
          claimName: moviesTmp.metadata.name,
        },
      },
      {
        name: 'tv',
        persistentVolumeClaim: {
          claimName: tv.metadata.name,
        },
      },
      {
        name: 'anime',
        persistentVolumeClaim: {
          claimName: anime.metadata.name,
        },
      },
      {
        name: 'music',
        persistentVolumeClaim: {
          claimName: music.metadata.name,
        },
      },
    ],
  },
});

// const rsyncScript: string = `
// #!/bin/bash

// export DEBIAN_FRONTEND=noninteractive
// apt-get update && apt-get upgrade -y
// apt-get install -y rsync
// rsync -avuhp --info=progress2 /mnt/src/ /mnt/dst
// `;

// const moviesRsync = new Job('movies', {
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
//             { name: 'dst', mountPath: '/mnt/dst' },
//           ],
//           resources: {
//             requests: {
//               cpu: '100m',
//               memory: '4Gi',
//             },
//             limits: {
//               cpu: '8',
//               memory: '8Gi',
//             },
//           },
//         }],
//         volumes: [
//           {
//             name: 'dst',
//             persistentVolumeClaim: {
//               claimName: movies.metadata.name,
//             },
//           },
//           {
//             name: 'src',
//             nfs: {
//               server: '192.168.1.11',
//               path: '/tank2/media/movies',
//             },
//           },
//         ],
//       },
//     },
//   },
// }, { dependsOn: movies });
