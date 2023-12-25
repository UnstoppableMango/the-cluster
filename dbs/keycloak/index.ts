import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Role, Database, Grant } from '@pulumi/postgresql';
import { Certificate } from '@unmango/thecluster-crds/certmanager/v1';
import { apps, clusterIssuers, system } from '@unmango/thecluster/cluster/from-stack';
import { allDbPermissions } from '@unmango/thecluster/dbs/postgres';

const provider = apps.postgresqlLa.provider;

const keycloakOwner = new Role('keycloak_owner', {
  name: 'keycloak_owner',
}, { provider });

const keycloak = new Role('keycloak', {
  name: 'keycloak',
  login: true,
  roles: [keycloakOwner.name],
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

const ns = Namespace.get('postgres', 'postgres', { provider: system.provider });
const cert = new Certificate('keycloak', {
  metadata: {
    name: 'keycloak',
    namespace: ns.metadata.name,
  },
  spec: {
    issuerRef: clusterIssuers.ref(x => x.postgres),
    secretName: 'keycloak-cert',
    usages: ['client auth'],
    commonName: 'keycloak',
    duration: '2160h0m0s', // 90d
    renewBefore: '360h0m0s', // 15d
    privateKey: {
      algorithm: 'RSA',
      encoding: 'PKCS1',
      size: 2048,
    },
  },
}, { provider: system.provider });

export const ip = apps.postgresqlLa.ip;
export const hostname = apps.postgresqlLa.hosts.internal;
export const clusterHostname = apps.postgresqlLa.clusterHostname;
export const port = apps.postgresqlLa.port;
export const database = db.name;
export const ownerGroup = keycloakOwner.name;
export const owner = keycloak.name;
