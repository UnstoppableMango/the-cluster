import * as pulumi from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { provider, credentials } from '@unmango/thecluster/apps/postgresql';
import { allDbPermissions } from '@unmango/thecluster/dbs/postgres';
import { requireProp } from '@unmango/thecluster';

export const user = pulumi.output(credentials)
  .apply(x => x.find(y => y.username === 'keycloak'));

const keycloakOwner = new pg.Role('keycloak_owner', {
  name: 'keycloak_owner',
}, { provider });

const keycloak = new pg.Role('keycloak', {
  name: user.apply(requireProp(x => x.username)),
  login: true,
  password: user.apply(requireProp(x => x.password)),
  roles: [keycloakOwner.name],
}, { provider });

const db = new pg.Database('keycloak', {
  name: 'keycloak',
  owner: keycloakOwner.name,
}, { provider, dependsOn: keycloak });

// const grant = new pg.Grant('all', {
//   objectType: 'database',
//   database: db.name,
//   privileges: allDbPermissions,
//   role: keycloak.name,
// }, { provider });

export const database = db.name;
