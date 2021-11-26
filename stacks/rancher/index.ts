import * as pulumi from '@pulumi/pulumi';
import * as rancher2 from '@pulumi/rancher2';
import { BackupRestore, Catalogs, OperatorStacks } from './resources';

const config = new pulumi.Config();

const cluster = rancher2.Cluster.get('local', 'local');

const clusterCatalogs = new Catalogs('catalogs', { clusterId: cluster.id });

// const stacks = new OperatorStacks('the-cluster');

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
