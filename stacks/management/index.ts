import { Config, StackReference } from '@pulumi/pulumi';
import { Project } from '@pulumi/rancher2';
import { Heimdall, Portainer } from './resources';

const config = new Config();
const remoteStack = config.require('remoteStack');

const stack = (name: string): string => `UnstoppableMango/${name}/${remoteStack}`;

const rancherRef = new StackReference(stack('rancher'));
const clusterId = rancherRef.requireOutput('clusterId');

const project = new Project('management', {
  name: 'Management',
  clusterId: clusterId,
});

const portainer = new Portainer('portainer', {
  chartVersion: '1.0.8',
  clusterId: clusterId,
  projectId: project.id,
});

const heimdall = new Heimdall('heimdall', {
  projectId: project.id,
});
