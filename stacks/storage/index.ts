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

// TODO: Import, but provisioner doesn't match so "import will fail"
// but provisioner is a required propery (and import is create not diff)
// so I can't just not specify it
// const longhornSc = new k8s.storage.v1.StorageClass('longhorn', {
//   metadata: {
//     name: 'longhorn',
//     namespace: longhorn.namespace.name,
//   },
//   provisioner: 'driver.longhorn.io',
//   // allowVolumeExpansion: true,
//   // reclaimPolicy: 'Retain',
//   // volumeBindingMode: 'Immediate',
//   // parameters: {
//   //   numberOfReplicas: '3',
//   //   staleReplicaTimeout: '30',
//   //   fromBackup: '',
//   //   fsType: 'ext4',
//   // },
// }, { import: 'longhorn' });

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
    diskSelector: 'hdd',
  },
});

const longhornSsd = new k8s.storage.v1.StorageClass('longhorn-ssd', {
  metadata: {
    name: 'longhorn-ssd',
    namespace: longhorn.namespace.name,
  },
  provisioner: 'driver.longhorn.io',
  allowVolumeExpansion: true,
  parameters: {
    numberOfReplicas: '3',
    staleReplicaTimeout: '30', // Minutes
    fsType: 'ext4',
    diskSelector: 'ssd',
  },
});
