import { Output, StackReference } from '@pulumi/pulumi';
import { cluster } from '../config';
import { PostgresDbOutputs } from '../types';

const ref = new StackReference('postgres-db', {
  name: `UnstoppableMango/thecluster-postgres-db/${cluster}`,
});

export const users = ref.requireOutput('users') as Output<PostgresDbOutputs['users']>;
export const schema = ref.requireOutput('schemaName') as Output<string>;

export const allPermissions = [
  'SELECT',
  'INSERT',
  'UPDATE',
  'DELETE',
  'TRUNCATE',
  'REFERENCES',
  'TRIGGER',
  'CREATE',
  'CONNECT',
  'TEMPORARY',
  'EXECUTE',
  'USAGE'
];

export const allDbPermissions = [
  'CREATE',
  'CONNECT',
  'TEMPORARY',
];

export { provider, hostname, ip, port, database } from '../apps/postgresql';
