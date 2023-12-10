import { Output, StackReference, all } from '@pulumi/pulumi';
import { Provider } from '@pulumi/postgresql';
import { hostname, port } from '../apps/postgresql';
import { cluster } from '../config';
import { DroneDbOutputs } from '../types';

const ref = new StackReference('drone-db', {
  name: `UnstoppableMango/thecluster-drone-db/${cluster}`,
});

export const user = ref.requireOutput('user') as Output<DroneDbOutputs['user']>;
export const database = ref.requireOutput('database') as Output<string>;
export { hostname, ip, port } from '../apps/postgresql';

export const provider = new Provider('drone', {
  host: hostname,
  port,
  database,
  username: user.username,
  password: user.password,
});
