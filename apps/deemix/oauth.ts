import { Group, GroupRoles, Role } from '@pulumi/keycloak';
import { AudienceProtocolMapper, Client, ClientOptionalScopes } from '@pulumi/keycloak/openid';
import { interpolate } from '@pulumi/pulumi';
import { redirectUris } from '@unstoppablemango/thecluster/apps/keycloak';
import { apps, realms } from '@unstoppablemango/thecluster/cluster/from-stack';
import { hosts } from './config';

const { provider } = apps.keycloak;

export const client = new Client('deemix', {
	realmId: realms.external.id,
	enabled: true,
	name: 'Deemix',
	clientId: 'deemix',
	accessType: 'CONFIDENTIAL',
	standardFlowEnabled: true,
	directAccessGrantsEnabled: false,
	baseUrl: interpolate`https://${hosts.external}`,
	validRedirectUris: redirectUris(hosts),
}, { provider });

const mapper = new AudienceProtocolMapper('deemix', {
	realmId: realms.external.id,
	name: interpolate`aud-mapper-${client.clientId}`,
	clientId: client.id,
	includedClientAudience: client.clientId,
	addToIdToken: true,
	addToAccessToken: true,
}, { provider });

export const loginRole = new Role('deemix-login', {
	realmId: realms.external.id,
	clientId: client.id,
	name: 'deemix-login',
	description: 'Deemix Login',
}, { provider });

export const readersGroup = new Group('deemix-readers', {
	realmId: realms.external.id,
	name: 'DeemixReaders',
	// Something is weird here
	// parentId: pulumi.output(groups).apply(g => g['Web App Readers']),
}, { provider });

const readersGroupRoles = new GroupRoles('deemix-readers', {
	realmId: realms.external.id,
	groupId: readersGroup.id,
	roleIds: [loginRole.id],
}, { provider });

const optionalScopes = new ClientOptionalScopes('deemix', {
	realmId: realms.external.id,
	clientId: client.id,
	optionalScopes: [realms.groupsScopeName],
}, { provider });
