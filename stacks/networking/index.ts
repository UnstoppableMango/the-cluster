import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import * as yaml from 'yaml';
import { CatalogsExport } from '@unmango/shared';
import { MetalLb, Traefik } from './resources';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const rancherRef = new pulumi.StackReference(`UnstoppableMango/rancher/${remoteStack}`);
const theCluster = rancher.Cluster.get('local', rancherRef.requireOutput('clusterId'));
const catalogs = rancherRef.requireOutput('catalogs').apply(x => x as CatalogsExport);
const bitnamiCatalog = rancher.Catalog.get('bitnami', catalogs.bitnamiId);

const project = new rancher.Project('networking', {
  name: 'Networking',
  clusterId: theCluster.id,
});

const metallbNs = new rancher.Namespace('metallb', {
  name: 'metallb-system',
  projectId: project.id,
});

const metallb = new MetalLb('metallb', {
  projectId: project.id,
  catalogName: bitnamiCatalog.name,
  version: '2.1.2',
  namespace: metallbNs.name,
  addresses: ['192.168.1.75-192.168.1.99'],
});

// const traefik = new Traefik('traefik', {
//   clusterId: theCluster.id,
//   projectId: project.id,
// });
