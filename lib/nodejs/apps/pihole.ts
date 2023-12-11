import { StackReference, interpolate } from '@pulumi/pulumi';
import { Provider } from '@unmango/pulumi-pihole';
import { cluster } from '../config';

const ref = new StackReference('pihole', {
  name: `UnstoppableMango/thecluster-pihole/${cluster}`,
});

export const hostname = ref.requireOutput('hostname');
export const password = ref.requireOutput('password');

export const provider = new Provider('pihole', {
  url: interpolate`https://${hostname}`,
  password,
});
