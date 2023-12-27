import { interpolate } from '@pulumi/pulumi';
import { Group, GroupRoles, Role } from '@pulumi/keycloak';
import { AudienceProtocolMapper, Client, ClientOptionalScopes } from '@pulumi/keycloak/openid';
import { apps, realms } from '@unmango/thecluster/cluster/from-stack';
import { hosts } from './config';

const { provider } = apps.keycloak;

export const client = new Client('pgadmin', {
  realmId: realms.external.id,
  enabled: true,
  name: 'pgAdmin4',
  clientId: 'pgadmin4',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  baseUrl: interpolate`https://${hosts.external}`,
  validRedirectUris: [
    // oauth2-proxy
    interpolate`https://${hosts.external}/oauth2/callback`,
    interpolate`https://${hosts.internal}/oauth2/callback`,
    // pgadmin4
    interpolate`https://${hosts.external}/oauth2/authorize`,
    interpolate`https://${hosts.internal}/oauth2/authorize`,
  ],
}, { provider });

const mapper = new AudienceProtocolMapper('pgadmin', {
  realmId: realms.external.id,
  name: interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider });

export const loginRole = new Role('pgadmin-login', {
  realmId: realms.external.id,
  clientId: client.id,
  name: 'pgadmin-login',
  description: 'PgAdmin4 Login',
}, { provider });

export const readersGroup = new Group('pgadmin-readers', {
  realmId: realms.external.id,
  name: 'PgAdmin4Readers',
  // Something is weird here
  // parentId: pulumi.output(groups).apply(g => g['Web App Readers']),
}, { provider });

const readersGroupRoles = new GroupRoles('pgadmin-readers', {
  realmId: realms.external.id,
  groupId: readersGroup.id,
  roleIds: [loginRole.id],
}, { provider });

const optionalScopes = new ClientOptionalScopes('pgadmin', {
  realmId: realms.external.id,
  clientId: client.id,
  optionalScopes: [realms.groupsScopeName],
}, { provider });
