import { StackReference, Output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/postgresql';
import { cluster } from '../config';
import { PostgreSqlOutputs } from '../types';

const ref = new StackReference('postgresql', {
  name: `UnstoppableMango/thecluster-postgresql/${cluster}`,
});

export const credentials = ref.requireOutput('credentials') as Output<PostgreSqlOutputs['credentials']>;
export const database = ref.requireOutput('database') as Output<string>;
export const port = ref.requireOutput('port') as Output<number>;
export const ip = ref.requireOutput('ip');

export const provider = new Provider('postgresql', {
  username: credentials.pulumi.username,
  password: credentials.pulumi.password,
  database,
  port,
});
