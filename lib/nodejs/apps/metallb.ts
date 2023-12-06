import { Output, StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('metallb', {
  name: `UnstoppableMango/thecluster-metallb/${cluster}`,
});

export const pool = ref.requireOutput('poolName') as Output<string>;
export const l2Advertisement = ref.requireOutput('advertisementName') as Output<string>;
export const loadBalancerClass = ref.requireOutput('loadBalancerClass') as Output<string>;
export const addresses = ref.requireOutput('addresses') as Output<string[]>;

export const outputs = {
  pool,
  l2Advertisement,
  loadBalancerClass,
  addresses,
};
