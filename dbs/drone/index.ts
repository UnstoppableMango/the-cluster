import * as pg from '@pulumi/postgresql';
import { apps, databases } from '@unmango/thecluster/cluster/from-stack';
import { allDbPermissions } from '@unmango/thecluster/dbs/postgres';

const provider = apps.postgresql.provider;

const droneOwner = new pg.Role('drone_owner', {
  name: 'drone_owner',
}, { provider });

const drone = new pg.Role('drone', {
  name: databases.drone.username,
  login: true,
  password: databases.drone.password,
  roles: [droneOwner.name],
}, { provider });

const db = new pg.Database('drone', {
  name: 'drone',
  owner: droneOwner.name,
}, { provider, dependsOn: drone });

const grant = new pg.Grant('all', {
  objectType: 'database',
  database: db.name,
  privileges: allDbPermissions,
  role: drone.name,
}, { provider });

export const database = db.name;
