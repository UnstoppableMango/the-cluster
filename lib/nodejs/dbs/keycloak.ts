import { Output, StackReference } from '@pulumi/pulumi';
import { Provider } from '@pulumi/postgresql';
import { hostname, port } from '../apps/postgresql';
import { cluster } from '../config';
import { KeycloakDbOutputs } from '../types';

const ref = new StackReference('keycloak-db', {
  name: `UnstoppableMango/thecluster-keycloak-db/${cluster}`,
});

export const user = ref.requireOutput('user') as Output<KeycloakDbOutputs['user']>;
export const database = ref.requireOutput('database') as Output<string>;
export { hostname, ip, port } from '../apps/postgresql';

export const provider = new Provider('keycloak', {
  host: hostname,
  port,
  database,
  username: user.username,
  password: user.password,
});
