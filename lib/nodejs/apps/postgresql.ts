import { StackReference, Output, output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/postgresql';
import { cluster } from '../config';
import { PostgreSqlOutputs } from '../types';

const ref = new StackReference('postgresql', {
  name: `UnstoppableMango/thecluster-postgresql/${cluster}`,
});

export const credentials = ref.requireOutput('credentials') as Output<PostgreSqlOutputs['credentials']>;
export const hostname = ref.requireOutput('hostname') as Output<string>;
export const database = ref.requireOutput('database') as Output<string>;
export const port = ref.requireOutput('port') as Output<number>;
export const ip = ref.requireOutput('ip') as Output<string>;

const user = output(credentials).apply(c => c.find(x => x.username === 'postgres'));
export const provider = new Provider('postgresql', {
  username: user.apply(x => x?.username ?? ''),
  password: user.apply(x => x?.password ?? ''),
  host: hostname,
  port,
  database,
  sslmode: 'disable',
});
