import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import { Longhorn } from './resources';

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

// export const harborAdminPassword = harbor.harborAdminPassword.result;
// export const harborValues = harbor.app.values;
