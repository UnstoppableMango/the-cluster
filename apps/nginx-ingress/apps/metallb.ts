import { StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('metallb', {
  name: `UntoppableMango/thecluster-metallb/${cluster}`,
});

export const loadBalancerClass = ref.requireOutput('loadBalancerClass');