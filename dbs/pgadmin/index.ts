import { Database, Grant, Role } from '@pulumi/postgresql';
import { apps } from '@unstoppablemango/thecluster/cluster/from-stack';
import { allDbPermissions } from '@unstoppablemango/thecluster/dbs/postgres';

const { provider } = apps.postgresqlLa;

const ownerGroup = new Role('owner', {
  name: 'pgadmin_owner',
}, { provider });

const db = new Database('pgadmin', {
  name: 'pgadmin',
  owner: ownerGroup.name,
}, { provider })

const owner = new Role('pgadmin', {
  name: 'pgadmin',
  login: true,
  roles: [ownerGroup.name],
}, { provider });

const grant = new Grant('all', {
  objectType: 'database',
  database: db.name,
  privileges: allDbPermissions,
  role: ownerGroup.name,
  columns: [],
  objects: [],
}, { provider });

export const ip = apps.postgresqlLa.ip;
export const hostname = apps.postgresqlLa.hosts.internal;
export const clusterHostname = apps.postgresqlLa.clusterHostname;
export const port = apps.postgresqlLa.port;
export const database = db.name;

const ownerGroupOutput = ownerGroup.name;
const ownerOutput = owner.name;

export {
  ownerGroupOutput as ownerGroup,
  ownerOutput as owner,
};
