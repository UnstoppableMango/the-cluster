import { StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('ceph-csi', {
  name: `UnstoppableMango/thecluster-ceph-csi/${cluster}`,
});

export const rbdStorageClass = ref.requireOutput('rbdClass');
export const cephfsStorageClass = ref.requireOutput('cephfsClass');
