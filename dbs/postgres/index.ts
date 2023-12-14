import * as pg from '@pulumi/postgresql';
import { apps } from '@unmango/thecluster/cluster/from-stack';

const { provider, database } = apps.postgresql;

const owner = new pg.Role('owner', {
  name: 'pgadmin_owner',
}, { provider });

const schema = new pg.Schema('pgadmin', {
  name: 'pgadmin',
  database,
  owner: owner.name,
}, { provider });

const pgadmin = new pg.Role('pgadmin', {
  name: 'pgadmin',
  login: true,
  password: apps.postgresql.user('pgadmin').password,
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
