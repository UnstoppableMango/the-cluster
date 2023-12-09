import * as pulumi from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { database, provider, credentials } from '@unmango/thecluster/apps/postgresql';

const owner = new pg.Role('owner', {
  name: 'pgadmin_owner',
}, { provider });

const schema = new pg.Schema('pgadmin', {
  name: 'pgadmin',
  database,
  owner: owner.name,
}, { provider });

const pgadminPassword = pulumi.output(credentials)
  .apply(x => x.find(y => y.username === 'pgadmin'))
  .apply(x => x?.password ?? '');

const pgadmin = new pg.Role('pgadmin', {
  name: 'pgadmin',
  login: true,
  password: pgadminPassword,
  roles: [owner.name],
}, { provider });

// const grant = new pg.Grant('schema', {
//   database,
//   role: pgadmin.name,
//   objectType: 'schema',
//   schema: schema.name,
//   privileges: ['CONNECT'],
// });

export const ownerRole = owner.name;
export const schemaName = schema.name;
export const users = pulumi.output(credentials).apply(x => x.filter(y => ['pgadmin'].includes(y.username)));
// export const credentials = {
//   pgadmin: {
//     username: pgadmin.name,
//     password: pgadminPassword.result,
//   },
// };
