import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
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

const longhornXl = new k8s.storage.v1.StorageClass('longhorn-xl', {
  metadata: {
    name: 'longhorn-xl',
    namespace: longhorn.namespace.name,
  },
  provisioner: 'driver.longhorn.io',
  allowVolumeExpansion: true,
  parameters: {
    numberOfReplicas: '1',
    staleReplicaTimeout: '30', // Minutes
    fsType: 'ext4',
  },
});
