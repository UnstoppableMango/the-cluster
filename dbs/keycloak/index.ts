import * as pg from '@pulumi/postgresql';
import { apps, databases } from '@unmango/thecluster/cluster/from-stack';
import { allDbPermissions } from '@unmango/thecluster/dbs/postgres';

const provider = apps.postgresqlHa.provider;

const keycloakOwner = new pg.Role('keycloak_owner', {
  name: 'keycloak_owner',
}, { provider });

const keycloak = new pg.Role('keycloak', {
  name: databases.keycloak.username,
  login: true,
  password: databases.keycloak.password,
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

export const database = db.name;
