import * as pulumi from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { provider, credentials } from '@unmango/thecluster/apps/postgresql';
import { allDbPermissions } from '@unmango/thecluster/dbs/postgres';
import { requireProp } from '@unmango/thecluster';

export const user = pulumi.output(credentials)
  .apply(x => x.find(y => y.username === 'dex'));

const dexOwner = new pg.Role('dex_owner', {
  name: 'dex_owner',
}, { provider });

const dex = new pg.Role('dex', {
  name: user.apply(requireProp(x => x.username)),
  login: true,
  password: user.apply(requireProp(x => x.password)),
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
