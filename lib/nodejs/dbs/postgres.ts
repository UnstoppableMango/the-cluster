import { Output, StackReference, all } from '@pulumi/pulumi';
import { cluster } from '../config';
import { PostgresDbOutputs } from '../types';

const ref = new StackReference('postgres-db', {
  name: `UnstoppableMango/thecluster-postgres-db/${cluster}`,
});

export const users = ref.requireOutput('users') as Output<PostgresDbOutputs['users']>;
export const schema = ref.requireOutput('schemaName') as Output<string>;

export {
  provider,
  hostname,
  ip,
  port,
  database,
} from '../apps/postgresql';
