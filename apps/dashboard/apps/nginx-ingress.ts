import { StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('cloudflare-ingress', {
  name: `UnstoppableMango/thecluster-nginx-ingress/${cluster}`,
});

export const nginxClass = ref.requireOutput('internalClass');
export const ip = ref.requireOutput('ip');
