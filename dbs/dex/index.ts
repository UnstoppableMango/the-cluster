import * as pg from '@pulumi/postgresql';
import { apps, databases } from '@unmango/thecluster/cluster/from-stack';
import { allDbPermissions } from '@unmango/thecluster/dbs/postgres';

const { provider } = apps.postgresql;

const dexOwner = new pg.Role('dex_owner', {
  name: 'dex_owner',
}, { provider });

const dex = new pg.Role('dex', {
  name: databases.dex.username,
  login: true,
  password: databases.dex.password,
  roles: [dexOwner.name],
}, { provider });

const db = new pg.Database('dex', {
  name: 'dex',
  owner: dexOwner.name,
}, { provider, dependsOn: dex });

const grant = new pg.Grant('all', {
  objectType: 'database',
  database: db.name,
  privileges: allDbPermissions,
  role: dex.name,
}, { provider });

export const database = db.name;
