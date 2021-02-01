import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import { getTheClusterRef, getRancherRef, getTheCluster } from '@unmango/the-cluster';
import { Deluge, DelugeConfig, Jackett, Lidarr, LinuxServerConfig, Pia, Radarr, Sonarr } from './resources';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const {
  k8sProvider,
  rancherProvider,
  defaultProject,
} = getTheCluster({
  theClusterRef: getTheClusterRef(remoteStack),
  rancherRef: getRancherRef(remoteStack),
});

const k8sOptions: pulumi.CustomResourceOptions = { provider: k8sProvider };
const rancherOptions: pulumi.CustomResourceOptions = { provider: rancherProvider };

const ns = new rancher.Namespace('media', {
  name: 'media',
  projectId: defaultProject.id,
}, rancherOptions);

const pia = config.requireObject<Pia>('pia');
const delugeConfig = config.requireObject<DelugeConfig>('deluge');

const { puid, pgid, tz } = config.requireObject<LinuxServerConfig>('linuxserver');
const linuxServerShared = new kx.ConfigMap('linuxserver-shared', {
  metadata: { namespace: ns.name },
  data: {
    PUID: `${puid}`,
    PGID: `${pgid}`,
    TZ: tz,
  },
}, k8sOptions);

const deluge = new Deluge('deluge', {
  deluge: delugeConfig,
  namespace: ns.name,
  pia,
  projectId: defaultProject.id,
}, { providers: [k8sProvider] });

const jackett = new Jackett('jackett', {
  namespace: ns.name,
  linuxServer: linuxServerShared,
}, { providers: [k8sProvider] });

// Sonarr
const tv = new Sonarr('tv', {
  namespace: ns.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('tv', '/tank1/media/tv'),
}, { providers: [k8sProvider] });

const tv4k = new Sonarr('tv4k', {
  namespace: ns.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('tv4k', '/tank1/media/tv4k'),
}, { providers: [k8sProvider] });

const anime = new Sonarr('anime', {
  namespace: ns.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  tvVolume: createMediaVolume('anime', '/tank1/media/anime'),
}, { providers: [k8sProvider] });

// Radarr
const movies = new Radarr('movies', {
  namespace: ns.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  moviesVolume: createMediaVolume('movies', '/tank1/media/movies'),
}, { providers: [k8sProvider] });

const movies4k = new Radarr('movies4k', {
  namespace: ns.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  moviesVolume: createMediaVolume('movies4k', '/tank1/media/movies4k'),
}, { providers: [k8sProvider] });

// Lidarr
const lidarr = new Lidarr('lidarr', {
  namespace: ns.name,
  linuxServer: linuxServerShared,
  downloads: deluge.downloads,
  musicVolume: createMediaVolume('music', '/tank1/media/music'),
}, { providers: [k8sProvider] });

function createMediaVolume(name: string, nfsPath: string): k8s.core.v1.PersistentVolume {
  return new k8s.core.v1.PersistentVolume(name, {
    metadata: { namespace: ns.name },
    spec: {
      accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
      capacity: { storage: '5000Gi' },
      storageClassName: 'nfs',
      nfs: { server: 'zeus', path: nfsPath },
    },
  }, k8sOptions);
}
