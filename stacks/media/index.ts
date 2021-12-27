import { Image } from '@pulumi/docker';
import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as pulumi from '@pulumi/pulumi';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { Namespace, Project } from '@pulumi/rancher2';
import { matchBuilder } from '@unmango/shared/traefik';

import {
  Bazarr,
  Deemix,
  Deluge,
  DelugeConfig,
  FlareSolverr,
  Jackett,
  Lidarr,
  LinuxServerConfig,
  Overseerr,
  PiaConfig,
  Prowlarr,
  Radarr,
  ServiceConnector,
  Sonarr,
} from './resources';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const rancherRef = new pulumi.StackReference(`UnstoppableMango/rancher/${remoteStack}`);
const clusterId = rancherRef.requireOutput('clusterId');

const project = new Project('media', {
  name: 'Media',
  clusterId: clusterId,
});

const namespace = new Namespace('media', {
  name: 'media',
  projectId: project.id,
});

const stripMediaPrefixes = new traefik.Middleware('strip-prefixes', {
  metadata: {
    name: 'strip-prefixes',
    namespace: namespace.name,
  },
  spec: {
    stripPrefix: {
      prefixes: [
        '/deluge',
      ],
      forceSlash: false,
    },
  },
});

const { puid, pgid, tz } = config.requireObject<LinuxServerConfig>('linuxserver');
const linuxServerShared = new kx.ConfigMap('linuxserver-shared', {
  metadata: {
    name: 'linuxserver-shared',
    namespace: namespace.name,
  },
  data: {
    PUID: `${puid}`,
    PGID: `${pgid}`,
    TZ: tz,
  },
});

// const { username, password } = config.requireObject<{
//   username: string, password: string,
// }>('registry');

// // const serviceConnector = new ServiceConnector('service-connector', {
// //   namespace: namespace.name,
// //   version: 'latest',
// //   registryUsername: username,
// //   registryPassword: password,
// // });

// Deluge
// const delugeNs = new Namespace('deluge', {
//   name: 'deluge',
//   projectId: project.id,
// });

const pia = config.requireObject<PiaConfig>('pia');
const delugeConfig = config.requireObject<DelugeConfig>('deluge');

const deluge = new Deluge('deluge', {
  deluge: delugeConfig,
  namespace: namespace.name,
  pia,
  projectId: project.id,
  storage: {
    accessModes: ['ReadWriteOnce'],
    class: 'longhorn',
    size: '1Gi',
  },
});

// Deluge supports a url base property for the webui in the conf file,
// but it sounds like it may get wonky with Servarrs so gonna leave it
// for now. Worth testing for myself though.
const externalDelugeRoute = new traefik.IngressRoute('deluge-ext', {
  metadata: {
    name: 'deluge-ext',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('deluge.thecluster.io')
        .build(),
      services: [{
        name: deluge.service.metadata.name,
        port: deluge.service.spec.ports[0].port,
        namespace: namespace.name,
      }],
      middlewares: [{
        name: 'basic-auth',
        namespace: 'traefik-system',
      }],
    }],
  },
});

const completedDownloadsNfs: {
  server: pulumi.Input<string>;
  path: pulumi.Input<string>;
} = {
  server: 'zeus',
  path: '/tank1/downloads/completed',
};

// Jackett
// const indexPublisher = new Image('index-publisher', {
//   build: {
//     context: './containers',
//     dockerfile: './containers/index-publisher/Dockerfile',
//   },
//   imageName: 'harbor.int.unmango.net/library/index-publisher:latest',
//   registry: {
//     server: 'https://harbor.int.unmango.net',
//     username,
//     password,
//   },
// });

const jackett = new Jackett('jackett', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
});

const externalJackettRoute = new traefik.IngressRoute('jackett-ext', {
  metadata: {
    name: 'jackett-ext',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/jackett')
        .build(),
      services: [{
        name: jackett.service.metadata.name,
        port: jackett.service.spec.ports[0].port,
        namespace: namespace.name,
      }],
      middlewares: [{
        name: 'basic-auth',
        namespace: 'traefik-system',
      }],
    }],
  },
});

// const flareSolverr = new FlareSolverr('flare-solverr', {
//   namespace: namespace.name,
//   version: 'latest',
// });

// // Servarr
// // const advertiserImage = new Image('servarr-advertiser', {
// //   build: {
// //     context: './containers',
// //     dockerfile: './containers/servarr-advertiser/Dockerfile',
// //   },
// //   imageName: 'harbor.int.unmango.net/library/servarr-advertiser:latest',
// //   registry: {
// //     server: 'https://harbor.int.unmango.net',
// //     username,
// //     password,
// //   },
// // });

// Prowlarr
const prowlarr = new Prowlarr('prowlarr', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
});

// Sonarr
// const sonarrNs = new Namespace('sonarr', {
//   name: 'sonarr',
//   projectId: project.id,
// });

const tv = new Sonarr('tv', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: completedDownloadsNfs,
  tv: {
    server: 'apollo',
    path: '/tank1/media/tv',
  },
});

const externalTvRoute = new traefik.IngressRoute('tv-ext', {
  metadata: {
    name: 'tv-ext',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/tv')
        .build(),
      services: [{
        name: tv.service.metadata.name,
        port: tv.service.spec.ports[0].port,
        namespace: namespace.name,
      }],
      middlewares: [{
        name: 'basic-auth',
        namespace: 'traefik-system',
      }],
    }],
  },
});

const tv4k = new Sonarr('tv4k', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: completedDownloadsNfs,
  tv: {
    server: 'zeus',
    path: '/tank1/media/tv4k',
  },
});

const externalTv4kRoute = new traefik.IngressRoute('tv4k-ext', {
  metadata: {
    name: 'tv4k-ext',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/tv4k')
        .build(),
      services: [{
        name: tv4k.service.metadata.name,
        port: tv4k.service.spec.ports[0].port,
        namespace: namespace.name,
      }],
      middlewares: [{
        name: 'basic-auth',
        namespace: 'traefik-system',
      }],
    }],
  },
});

const anime = new Sonarr('anime', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: completedDownloadsNfs,
  tv: {
    server: 'zeus',
    path: '/tank1/media/anime',
  },
});

const externalAnimeRoute = new traefik.IngressRoute('anime-ext', {
  metadata: {
    name: 'anime-ext',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/anime')
        .build(),
      services: [{
        name: anime.service.metadata.name,
        port: anime.service.spec.ports[0].port,
        namespace: namespace.name,
      }],
      middlewares: [{
        name: 'basic-auth',
        namespace: 'traefik-system',
      }],
    }],
  },
});

// Radarr
const movies = new Radarr('movies', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: completedDownloadsNfs,
  movies: {
    server: 'apollo',
    path: '/tank1/media/movies',
  },
});

const externalMoviesRoute = new traefik.IngressRoute('movies-ext', {
  metadata: {
    name: 'movies-ext',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/movies')
        .build(),
      services: [{
        name: movies.service.metadata.name,
        port: movies.service.spec.ports[0].port,
        namespace: namespace.name,
      }],
      middlewares: [{
        name: 'basic-auth',
        namespace: 'traefik-system',
      }],
    }],
  },
});

const movies4k = new Radarr('movies4k', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: completedDownloadsNfs,
  movies: {
    server: 'zeus',
    path: '/tank1/media/movies4k',
  },
});

const externalMovies4kRoute = new traefik.IngressRoute('movies4k-ext', {
  metadata: {
    name: 'movies4k-ext',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/movies4k')
        .build(),
      services: [{
        name: movies4k.service.metadata.name,
        port: movies4k.service.spec.ports[0].port,
        namespace: namespace.name,
      }],
      middlewares: [{
        name: 'basic-auth',
        namespace: 'traefik-system',
      }],
    }],
  },
});

// Bazarr
const bazarr = new Bazarr('bazarr', {
  linuxServer: linuxServerShared,
  namespace: namespace.name,
  nfsMounts: [{
    name: 'anime',
    server: 'zeus',
    sourcePath: '/tank1/media/anime',
    destPath: '/anime',
  }, {
    name: 'movies',
    server: 'apollo',
    sourcePath: '/tank1/media/movies',
    destPath: '/movies',
  }, {
    name: 'movies4k',
    server: 'zeus',
    sourcePath: '/tank1/media/movies4k',
    destPath: '/movies4k',
  }, {
    name: 'tv',
    server: 'apollo',
    sourcePath: '/tank1/media/tv',
    destPath: '/tv',
  }, {
    name: 'tv4k',
    server: 'zeus',
    sourcePath: '/tank1/media/tv4k',
    destPath: '/tv4k',
  }],
});

// // Lidarr
// // const lidarrNs = new Namespace('lidarr', {
// //   name: 'lidarr',
// //   projectId: project.id,
// // });

// const lidarr = new Lidarr('lidarr', {
//   namespace: namespace.name,
//   linuxServer: linuxServerShared,
//   downloads: deluge.downloads,
//   musicVolume: createMediaVolume('music', namespace.name, '/tank1/media/music'),
// });

// Overseer
const overseer = new Overseerr('overseerr', {
  linuxServer: linuxServerShared,
  namespace: namespace.name,
});

const deemixConfig = config.requireObject<{ arl: string }>('deemix');

const deemix = new Deemix('deemix', {
  namespace: namespace.name,
  arl: deemixConfig.arl,
});

const mediaMiddlewares = [{
  name: 'basic-auth',
  namespace: 'traefik-system',
}];

const mediaRoutes = new traefik.IngressRoute('media', {
  metadata: {
    name: 'media',
    namespace: namespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/prowlarr')
        .build(),
      services: [{
        name: prowlarr.service.metadata.name,
        port: prowlarr.service.spec.ports[0].port,
      }],
      middlewares: mediaMiddlewares,
    }, {
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/bazarr')
        .build(),
      services: [{
        name: bazarr.service.metadata.name,
        port: bazarr.service.spec.ports[0].port,
      }],
      middlewares: mediaMiddlewares,
    }, {
      kind: 'Rule',
      match: matchBuilder()
        .host('media.thecluster.io').and().pathPrefix('/overseer')
        .build(),
      services: [{
        name: overseer.service.metadata.name,
        port: overseer.service.spec.ports[0].port,
      }],
      middlewares: mediaMiddlewares,
    }],
  },
});

function createMediaVolume(name: string, ns: pulumi.Input<string>, nfsPath: string): k8s.core.v1.PersistentVolume {
  return new k8s.core.v1.PersistentVolume(name, {
    metadata: { namespace: ns },
    spec: {
      accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
      capacity: { storage: '5000Gi' },
      storageClassName: 'nfs',
      nfs: { server: 'zeus', path: nfsPath },
    },
  });
}
