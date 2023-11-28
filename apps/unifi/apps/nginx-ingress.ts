import { StackReference, getStack } from '@pulumi/pulumi';

const cluster = getStack();
const ref = new StackReference('nginx-ingress', {
  name: `UnstoppableMango/thecluster-nginx-ingress/${cluster}`,
});

export const ingressClass = ref.requireOutput('ingressClass');
