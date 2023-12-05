import { Output, StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';
import { CephCsiOutputs } from '../types';

const ref = new StackReference('ceph-csi', {
  name: `UnstoppableMango/thecluster-ceph-csi/${cluster}`,
});

export const rbdStorageClass = ref.requireOutput('rbdClass') as Output<string>;
export const cephfsStorageClass = ref.requireOutput('cephfsClass') as Output<string>;

export const outputs: CephCsiOutputs = {
  rbdStorageClass,
  cephfsStorageClass,
}
