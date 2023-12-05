import { StackReference, Output, interpolate } from '@pulumi/pulumi';
import { Provider } from '@pulumi/keycloak';
import { cluster } from '../config';

const ref = new StackReference('keycloak', {
  name: `UnstoppableMango/thecluster-keycloak/${cluster}`,
});

export const hostname = ref.requireOutput('hostname') as Output<string>;
export const realm = ref.requireOutput('realm') as Output<string>;

export const provider = new Provider('keycloak', {
  url: interpolate`https://${hostname}`,
  username: 'admin',
  password: ref.requireOutput('password'),
  clientId: 'admin-cli',
});
