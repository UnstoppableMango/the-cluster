import { StackReference, interpolate } from '@pulumi/pulumi';
import { Provider } from '@unmango/pulumi-pihole';
import { cluster } from '../config';

const ref = new StackReference('pihole', {
  name: `UnstoppableMango/thecluster-pihole/${cluster}`,
});

const hostname = ref.requireOutput('hostname');
const password = ref.requireOutput('password');

export const provider = new Provider('pihole', {
  url: interpolate`https://${hostname}`,
  password,
});
