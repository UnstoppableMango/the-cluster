import * as pulumi from '@pulumi/pulumi';
import * as kx from '@pulumi/kubernetesx';
import * as rancher from '@pulumi/rancher2';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { matchBuilder } from '@unmango/shared/traefik';

const project = new rancher.Project('gaming', {
  name: 'Gaming',
  clusterId: 'local',
});

const sfNamespace = new rancher.Namespace('satisfactory', {
  name: 'satisfactory',
  projectId: project.id,
});

const sfConfig = new kx.PersistentVolumeClaim('satisfactory', {
  metadata: {
    name: 'satisfactory',
    namespace: sfNamespace.name,
  },
  spec: {
    storageClassName: 'longhorn',
    resources: { requests: { storage: '10Gi' } },
  },
});

const sfBackups = new kx.PersistentVolumeClaim('satisfactory-backups', {
  metadata: {
    name: 'satisfactory-backups',
    namespace: sfNamespace.name,
  },
  spec: {
    storageClassName: 'longhorn',
    resources: { requests: { storage: '15Gi' } },
  },
});

const sfGameFiles = new kx.PersistentVolumeClaim('satisfactory-game-files', {
  metadata: {
    name: 'satisfactory-game-files',
    namespace: sfNamespace.name,
  },
  spec: {
    storageClassName: 'longhorn-ssd',
    resources: { requests: { storage: '100Gi' } },
  },
});

// https://hub.docker.com/r/wolveix/satisfactory-server
const sfpb = new kx.PodBuilder({
  containers: [{
    name: 'satisfactory',
    image: 'wolveix/satisfactory-server',
    ports: [
      { containerPort: 7777 }, // Game port
      { containerPort: 15000 }, // Beacon port
      { containerPort: 15777 }, // Query port
    ],
    env: {
      AUTOPAUSE: 'true', // Default 'true'
      AUTOSAVEINTERVAL: '300', // In seconds. Default 300
      AUTOSAVENUM: '10', // Default 3
      AUTOSAVEONDISCONNECT: 'true', // Default 'true'
      MAXPLAYERS: '6',
      PGID: '1001',
      PUID: '1000',
      SKIPUPDATE: 'false', // Default 'false'
      STEAMBETA: 'false',
    },
    volumeMounts: [
      sfConfig.mount('/config'),
      sfBackups.mount('/config/backups'),
      sfGameFiles.mount('/config/gamefiles'),
    ],
  }],
});

const sfDeployment = new kx.Deployment('satisfactory', {
  metadata: {
    name: 'satisfactory',
    namespace: sfNamespace.name,
  },
  spec: sfpb.asDeploymentSpec({
    strategy: { type: 'Recreate' },
  }),
});

const sfService = sfDeployment.createService({
  type: kx.types.ServiceType.ClusterIP,
});

const sfIngress = new traefik.IngressRoute('satisfactory', {
  metadata: {
    name: 'satisfactory',
    namespace: sfNamespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('satisfactory.thecluster.io')
        .build(),
      services: [{
        name: sfService.metadata.name,
      }],
    }],
  },
});
