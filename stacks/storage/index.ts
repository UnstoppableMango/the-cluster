import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import { Duplicati, Harbor, Longhorn, Minio, NfsClient } from './resources';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const theClusterRef = new pulumi.StackReference(`UnstoppableMango/rancher/${remoteStack}`);
const clusterId = theClusterRef.requireOutput('clusterId');

const project = new rancher.Project('storage', {
  name: 'Storage',
  clusterId: clusterId,
});

const ckotzbauer = new rancher.CatalogV2('ckotzbauer', {
  clusterId,
  name: 'ckotzbauer',
  url: 'https://ckotzbauer.github.io/helm-charts',
});

const longhorn = new Longhorn('longhorn', {
  clusterId: clusterId,
  projectId: project.id,
  version: '1.2.200+up1.2.2',
});

const nfsClient = new NfsClient('nfs-client', {
  clusterId: clusterId,
  projectId: project.id,
  subPath: 'rancher',
});

const nfsBackup = new NfsClient('backup', {
  clusterId,
  projectId: project.id,
  subPath: 'backup',
  storageClass: 'nfs-backup',
});

const { password, htpasswd } = config.requireObject<{
  password: string, htpasswd: string,
}>('registry');

// const harbor = new Harbor('harbor', {
//   clusterId: clusterId,
//   projectId: project.id,
//   version: '9.4.6',
//   registryPassword: password,
//   registryHtpasswd: htpasswd,
// });

const minioBackup = new NfsClient('minio', {
  clusterId,
  projectId: project.id,
  subPath: 'backup/minio',
  storageClass: 'minio',
});

const minio = new Minio('minio', {
  clusterId,
  projectId: project.id,
  storageClass: 'minio',
});

// const duplicati = new Duplicati('duplicati', {
//   clusterId,
//   projectId: project.id,
// });

export const minioAccessKey = minio.accessKey.result;
export const minioSecretKey = minio.secretKey.result;

// export const harborAdminPassword = harbor.harborAdminPassword.result;
// export const harborValues = harbor.app.values;
