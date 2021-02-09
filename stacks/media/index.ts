import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as pulumi from '@pulumi/pulumi';
import { Namespace, Project } from '@pulumi/rancher2';

import {
  Deluge,
  DelugeConfig,
  FlareSolverr,
  Jackett,
  Lidarr,
  LinuxServerConfig,
  Pia,
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

const pia = config.requireObject<Pia>('pia');
const delugeConfig = config.requireObject<DelugeConfig>('deluge');

const { puid, pgid, tz } = config.requireObject<LinuxServerConfig>('linuxserver');
const linuxServerShared = new kx.ConfigMap('linuxserver-shared', {
  metadata: { namespace: namespace.name },
  data: {
    PUID: `${puid}`,
    PGID: `${pgid}`,
    TZ: tz,
  },
});

// Deluge
// const delugeNs = new Namespace('deluge', {
//   name: 'deluge',
//   projectId: project.id,
// });

const deluge = new Deluge('deluge', {
  deluge: delugeConfig,
  namespace: namespace.name,
  pia,
  projectId: project.id,
});

// Jackett
// const jackettNs = new Namespace('jackett', {
//   name: 'jackett',
//   projectId: project.id,
// });

const jackett = new Jackett('jackett', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
});

const flareSolverr = new FlareSolverr('flare-solverr', {
  namespace: namespace.name,
  version: 'latest',
});

// Sonarr
// const sonarrNs = new Namespace('sonarr', {
//   name: 'sonarr',
//   projectId: project.id,
// });

const tv = new Sonarr('tv', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('tv', namespace.name, '/tank1/media/tv'),
});

const tv4k = new Sonarr('tv4k', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('tv4k', namespace.name, '/tank1/media/tv4k'),
});

const anime = new Sonarr('anime', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('anime', namespace.name, '/tank1/media/anime'),
});

// Radarr
// const radarrNs = new Namespace('radarr', {
//   name: 'radarr',
//   projectId: project.id,
// });

const movies = new Radarr('movies', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  moviesVolume: createMediaVolume('movies', namespace.name, '/tank1/media/movies'),
});

const movies4k = new Radarr('movies4k', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  moviesVolume: createMediaVolume('movies4k', namespace.name, '/tank1/media/movies4k'),
});

// Lidarr
// const lidarrNs = new Namespace('lidarr', {
//   name: 'lidarr',
//   projectId: project.id,
// });

const lidarr = new Lidarr('lidarr', {
  namespace: namespace.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  musicVolume: createMediaVolume('music', namespace.name, '/tank1/media/music'),
});

const { username, password } = config.requireObject<{
  username: string, password: string,
}>('registry');

const serviceConnector = new ServiceConnector('connector', {
  version: 'latest',
  configClaims: [
    jackett.config,
    lidarr.config,
    movies.config,
    movies4k.config,
    tv.config,
    tv4k.config,
  ],
  registryUsername: username,
  registryPassword: password,
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
