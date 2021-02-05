import * as pulumi from '@pulumi/pulumi';
import * as rancher2 from '@pulumi/rancher2';
import { createExport } from '@unmango/shared';
import { Catalogs, CertManager, OperatorStacks, Rancher } from './resources';

const config = new pulumi.Config();

// const certManager = new CertManager('cert-manager', {
//   version: '1.1.0',
// });

// const rancher = new Rancher('rancher', {}, { dependsOn: certManager });

// const cluster = rancher2.Cluster.get('local', 'local', undefined, { dependsOn: rancher });

// const clusterCatalogs = new Catalogs('catalogs', {
//   clusterId: cluster.id,
// }, { dependsOn: rancher });

// const stacks = new OperatorStacks('the-cluster');

// export const clusterId = cluster.id;
// export const defaultProjectId = cluster.defaultProjectId;

// export const catalogs = createExport(clusterCatalogs);
