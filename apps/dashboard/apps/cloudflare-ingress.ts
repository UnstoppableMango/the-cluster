import { StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('cloudflare-ingress', {
  name: `UnstoppableMango/thecluster-cloudflare-ingress/${cluster}`,
});

export const cfClass = ref.requireOutput('ingressClass');
