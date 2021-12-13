import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as rancher2 from '@pulumi/rancher2';
import { BackupRestore, Catalogs } from './resources';

const config = new pulumi.Config();

const rancherRelease = new k8s.helm.v3.Release('rancher', {
  name: 'rancher',
  chart: 'rancher',
  namespace: 'cattle-system',
  version: '2.6.0',
  repositoryOpts: {
    repo: 'https://releases.rancher.com/server-charts/latest',
  },
  values: {
    hostname: 'rancher.int.unmango.net',
    tls: 'external',
  },
});

const cluster = rancher2.Cluster.get('local', 'local');

const clusterCatalogs = new Catalogs('catalogs', { clusterId: cluster.id });

const cattleResources = new rancher2.Namespace('cattle-resources-system', {
  name: 'cattle-resources-system',
  projectId: cluster.systemProjectId,
});

const backupRestore = new BackupRestore('rancher-backup', {
  clusterId: cluster.id,
  namespace: cattleResources.name,
  storageClass: 'longhorn',
  volumeSize: '5Gi',
});

export const clusterId = cluster.id;
export const defaultProjectId = cluster.defaultProjectId;
