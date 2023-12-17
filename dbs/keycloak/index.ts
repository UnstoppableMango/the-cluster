import * as pg from '@pulumi/postgresql';
import { apps } from '@unmango/thecluster/cluster/from-stack';
import { allDbPermissions } from '@unmango/thecluster/dbs/postgres';

const provider = apps.postgresqlHa.provider;

const keycloakOwner = new pg.Role('keycloak_owner', {
  name: 'keycloak_owner',
}, { provider });

const user = apps.postgresqlHa.user('keycloak');
const keycloak = new pg.Role('keycloak', {
  name: user.username,
  login: true,
  password: user.password,
  roles: [keycloakOwner.name],
}, { provider });

const db = new pg.Database('keycloak', {
  name: 'keycloak',
  owner: keycloakOwner.name,
}, { provider, dependsOn: keycloak });

const grant = new pg.Grant('all', {
  objectType: 'database',
  database: db.name,
  privileges: allDbPermissions,
  role: keycloak.name,
}, { provider });

export const clusterIp = apps.postgresqlHa.clusterIp;
export const ip = apps.postgresqlHa.ip;
export const hostname = apps.postgresqlHa.hostname;
export const port = apps.postgresqlHa.port;
export const database = db.name;
export const ownerGroup = keycloakOwner.name;
export const owner = {
  username: keycloak.name,
  password: keycloak.password,
};
