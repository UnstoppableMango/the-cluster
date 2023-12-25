import * as pulumi from '@pulumi/pulumi';
import { Database, Role, Schema } from '@pulumi/postgresql';
import { apps } from '@unmango/thecluster/cluster/from-stack';

const { provider } = apps.postgresqlLa;

const owner = new Role('owner', {
  name: 'pgadmin_owner',
}, { provider });

const database = new Database('pgadmin', {
  name: 'pgadmin',
  owner: owner.name,
}, { provider })

const pgadmin = new Role('pgadmin', {
  name: 'pgadmin',
  login: true,
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
