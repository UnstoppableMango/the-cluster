import { StackReference, getStack } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('metallb', {
  name: `UnstoppableMango/thecluster-metallb/${cluster}`,
});

export const pool = ref.requireOutput('poolName');
