import { StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';

const ref = new StackReference('cert-manager', {
  name: `UnstoppableMango/thecluster-cert-manager/${cluster}`,
});

export const issuer = ref.requireOutput('prod');
