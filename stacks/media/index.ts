import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as pulumi from '@pulumi/pulumi';
import { Namespace, Project } from '@pulumi/rancher2';

import {
  Deluge,
  DelugeConfig,
  Jackett,
  Lidarr,
  LinuxServerConfig,
  Pia,
  Radarr,
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

const delugeNs = new Namespace('deluge', {
  name: 'deluge',
  projectId: project.id,
});

const deluge = new Deluge('deluge', {
  deluge: delugeConfig,
  namespace: delugeNs.name,
  pia,
  projectId: project.id,
});

const jackettNs = new Namespace('jackett', {
  name: 'jackett',
  projectId: project.id,
});

const jackett = new Jackett('jackett', {
  namespace: jackettNs.name,
  linuxServer: linuxServerShared,
});

// Sonarr
const sonarrNs = new Namespace('sonarr', {
  name: 'sonarr',
  projectId: project.id,
});

const tv = new Sonarr('tv', {
  namespace: sonarrNs.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('tv', sonarrNs.name, '/tank1/media/tv'),
});

const tv4k = new Sonarr('tv4k', {
  namespace: sonarrNs.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('tv4k', sonarrNs.name, '/tank1/media/tv4k'),
});

const anime = new Sonarr('anime', {
  namespace: sonarrNs.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('anime', sonarrNs.name, '/tank1/media/anime'),
});

// Radarr
const radarrNs = new Namespace('radarr', {
  name: 'radarr',
  projectId: project.id,
});

const movies = new Radarr('movies', {
  namespace: radarrNs.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  moviesVolume: createMediaVolume('movies', radarrNs.name, '/tank1/media/movies'),
});

const movies4k = new Radarr('movies4k', {
  namespace: radarrNs.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  moviesVolume: createMediaVolume('movies4k', radarrNs.name, '/tank1/media/movies4k'),
});

// Lidarr
const lidarrNs = new Namespace('lidarr', {
  name: 'lidarr',
  projectId: project.id,
});

const lidarr = new Lidarr('lidarr', {
  namespace: lidarrNs.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  musicVolume: createMediaVolume('music', lidarrNs.name, '/tank1/media/music'),
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
