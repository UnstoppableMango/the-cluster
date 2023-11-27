import { StackReference, getStack } from '@pulumi/pulumi';

const cluster = getStack();
const ref = new StackReference('cloudflare-ingress', {
  name: `UnstoppableMango/thecluster-cloudflare-ingress/${cluster}`,
});

export const ingressClass = ref.requireOutput('ingressClass');
