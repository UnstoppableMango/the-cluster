import { StackReference, interpolate } from '@pulumi/pulumi';
import { Provider } from '@unmango/pulumi-pihole';
import { piholeStack } from '../config';

const ref = new StackReference('pihole', {
  name: `UnstoppableMango/thecluster-pihole/${piholeStack}`,
});

const hostname = ref.requireOutput('hostname');
const password = ref.requireOutput('password');

export const provider = new Provider(piholeStack, {
  url: interpolate`https://${hostname}`,
  password,
});
