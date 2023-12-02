import { StackReference, getStack } from '@pulumi/pulumi';

const cluster = getStack();
const ref = new StackReference('nginx-ingress', {
  name: `UnstoppableMango/thecluster-ceph-csi/${cluster}`,
});

export const storageClass = ref.requireOutput('rbdClass');
