import { StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('ceph-csi', {
  name: `UnstoppableMango/thecluster-ceph-csi/${cluster}`,
});

export const storageClass = ref.requireOutput('cephfsClass');
