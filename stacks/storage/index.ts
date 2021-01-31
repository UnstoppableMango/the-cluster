import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import { Longhorn, NfsClient } from './resources';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const theClusterRef = new pulumi.StackReference(`UnstoppableMango/rancher/${remoteStack}`);
const clusterId = theClusterRef.requireOutput('clusterId');

const project = new rancher.Project('storage', {
  name: 'Storage',
  clusterId: clusterId,
});

const longhorn = new Longhorn('longhorn', {
  clusterId: clusterId,
  projectId: project.id,
  version: '1.1.000',
});

const nfsClient = new NfsClient('nfs-client', {
  clusterId: clusterId,
  projectId: project.id,
  version: '1.0.2',
});
