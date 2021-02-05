import * as pulumi from '@pulumi/pulumi';
import * as rancher2 from '@pulumi/rancher2';
import { createExport } from '@unmango/shared';
import { Catalogs, OperatorStacks } from './resources';

const config = new pulumi.Config();

const cluster = rancher2.Cluster.get('local', 'local');

const clusterCatalogs = new Catalogs('catalogs', { clusterId: cluster.id });

// const stacks = new OperatorStacks('the-cluster');

export const clusterId = cluster.id;
export const defaultProjectId = cluster.defaultProjectId;

export const catalogs = createExport(clusterCatalogs);
