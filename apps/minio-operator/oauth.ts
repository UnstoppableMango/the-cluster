import { interpolate } from '@pulumi/pulumi';
import { Group, GroupRoles, Role } from '@pulumi/keycloak';
import { AudienceProtocolMapper, Client, ClientOptionalScopes } from '@pulumi/keycloak/openid';
import { apps, realms } from '@unstoppablemango/thecluster/cluster/from-stack';
import { hosts } from './config';

const { provider } = apps.keycloak;

export const client = new Client('minio-operator', {
  realmId: realms.external.id,
  enabled: true,
  name: 'Minio Operator',
  clientId: 'minio-operator',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  baseUrl: interpolate`https://${hosts.external}`,
  validRedirectUris: [
    interpolate`https://${hosts.external}/oauth2/callback`,
    interpolate`https://${hosts.internal}/oauth2/callback`,
  ],
}, { provider });

const mapper = new AudienceProtocolMapper('minio-operator', {
  realmId: realms.external.id,
  name: interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider });

export const loginRole = new Role('minio-operator-login', {
  realmId: realms.external.id,
  clientId: client.id,
  name: 'minio-operator-login',
  description: 'Minio Operator Login',
}, { provider });

export const readersGroup = new Group('minio-operator-readers', {
  realmId: realms.external.id,
  name: 'MinioOperatorReaders',
  // Something is weird here
  // parentId: pulumi.output(groups).apply(g => g['Web App Readers']),
}, { provider });

const readersGroupRoles = new GroupRoles('minio-operator-readers', {
  realmId: realms.external.id,
  groupId: readersGroup.id,
  roleIds: [loginRole.id],
}, { provider });

const optionalScopes = new ClientOptionalScopes('minio-operator', {
  realmId: realms.external.id,
  clientId: client.id,
  optionalScopes: [realms.groupsScopeName],
}, { provider });
