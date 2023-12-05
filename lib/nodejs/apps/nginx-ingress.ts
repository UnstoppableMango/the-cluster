import { StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('nginx-ingress', {
  name: `UnstoppableMango/thecluster-nginx-ingress/${cluster}`,
});

export const internalClass = ref.requireOutput('internalClass');
export const clusterClass = ref.requireOutput('clusterClass');
