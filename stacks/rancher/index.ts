import * as k8s from '@pulumi/kubernetes';
import * as rancher2 from '@pulumi/rancher2';
import { BackupRestore, Catalogs } from './resources';
import { IngressRoute } from '@pulumi/crds/traefik/v1alpha1';

const rancherRelease = new k8s.helm.v3.Release('rancher', {
  name: 'rancher',
  chart: 'rancher',
  namespace: 'cattle-system',
  version: '2.6.2',
  repositoryOpts: {
    repo: 'https://releases.rancher.com/server-charts/latest',
  },
  values: {
    hostname: 'rancher.int.unmango.net',
    tls: 'external',
    // Don't co-locate on the same physical host
    topologyKey: 'host',
  },
});

const rancherClusterIo = new IngressRoute('rancher-thecluster-io', {
  metadata: { namespace: 'cattle-system' },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      match: 'Host(`rancher.thecluster.io`)',
      kind: 'Rule',
      services: [{
        name: 'rancher',
        port: 80,
      }],
    }],
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
