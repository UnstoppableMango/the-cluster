import { RandomPassword } from '@pulumi/random';
import { Role, Database, Grant } from '@pulumi/postgresql';
import { apps } from '@unstoppablemango/thecluster/cluster/from-stack';
import { allDbPermissions } from '@unstoppablemango/thecluster/dbs/postgres';

const provider = apps.postgresqlLa.provider;

const password = new RandomPassword('keycloak', {
  length: 48,
  special: false,
});

const keycloakOwner = new Role('keycloak_owner', {
  name: 'keycloak_owner',
}, { provider });

const keycloak = new Role('keycloak', {
  name: 'keycloak',
  login: true,
  roles: [keycloakOwner.name],
  password: password.result,
}, { provider });

const db = new Database('keycloak', {
  name: 'keycloak',
  owner: keycloakOwner.name,
}, { provider, dependsOn: keycloak });

const grant = new Grant('all', {
  objectType: 'database',
  database: db.name,
  privileges: allDbPermissions,
  role: keycloak.name,
}, { provider });

export const ip = apps.postgresqlLa.ip;
export const hostname = apps.postgresqlLa.hosts.internal;
export const clusterHostname = apps.postgresqlLa.clusterHostname;
export const port = apps.postgresqlLa.port;
export const database = db.name;
export const ownerGroup = keycloakOwner.name;
export const owner = keycloak.name;

const passwordOutput = password.result;
export { passwordOutput as password };
