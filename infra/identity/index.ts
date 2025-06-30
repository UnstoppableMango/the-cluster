import * as keycloak from '@pulumi/keycloak';
import * as pulumi from '@pulumi/pulumi';
import { apps } from '@unstoppablemango/thecluster/cluster/from-stack';
import { github, google, me, microsoft, stackExchange, twitter } from './config';

const provider = apps.keycloak.provider;

const externalRealm = new keycloak.Realm('external', {
	realm: 'external',
	displayName: 'THECLUSTER',
	displayNameHtml: 'THECLUSTER',
	registrationAllowed: false, // Maybe later
	registrationEmailAsUsername: false,
	duplicateEmailsAllowed: true,
	loginWithEmailAllowed: false,
	editUsernameAllowed: true,
	rememberMe: true,
	verifyEmail: true,
}, { provider });

const githubIdp = new keycloak.oidc.IdentityProvider('github', {
	realm: externalRealm.id,
	enabled: true,
	guiOrder: '1',
	alias: 'github',
	providerId: 'github',
	displayName: 'GitHub',
	clientId: github.clientId,
	clientSecret: github.clientSecret,
	authorizationUrl: 'https://github.com/login/oauth/authorize',
	tokenUrl: 'https://github.com/login/oauth/access_token',
	userInfoUrl: 'https://api.github.com/user',
	defaultScopes: 'user:email',
	trustEmail: true,
	syncMode: 'IMPORT',
}, { provider });

const googleIdp = new keycloak.oidc.GoogleIdentityProvider('google', {
	realm: externalRealm.id,
	enabled: true,
	guiOrder: '3',
	clientId: google.clientId,
	clientSecret: google.clientSecret,
	trustEmail: true,
	syncMode: 'IMPORT',
}, { provider });

const microsoftIdp = new keycloak.oidc.IdentityProvider('microsoft', {
	realm: externalRealm.id,
	enabled: true,
	guiOrder: '2',
	alias: 'microsoft',
	providerId: 'microsoft',
	displayName: 'Microsoft',
	clientId: microsoft.clientId,
	clientSecret: microsoft.clientSecret,
	authorizationUrl: `https://login.microsoftonline.com/${microsoft.tenantId}/oauth2/v2.0/authorize`,
	tokenUrl: `https://login.microsoftonline.com/${microsoft.tenantId}/oauth2/v2.0/token`,
	trustEmail: true,
	syncMode: 'IMPORT',
}, { provider });

const twitterIdp = new keycloak.oidc.IdentityProvider('twitter', {
	realm: externalRealm.id,
	enabled: true,
	guiOrder: '4',
	alias: 'twitter',
	providerId: 'twitter',
	displayName: 'Twitter',
	clientId: twitter.clientId,
	clientSecret: twitter.clientSecret,
	authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
	tokenUrl: 'https://twitter.com/i/oauth2/token',
	// userInfoUrl: 'https://api.github.com/user',
	// defaultScopes: 'user:email',
	trustEmail: true,
	syncMode: 'IMPORT',
}, { provider });

// const stackExchangeIdp = new keycloak.oidc.IdentityProvider('stackexchange', {
//   realm: externalRealm.id,
//   enabled: true,
//   guiOrder: '5',
//   alias: 'stack-exchange',
//   providerId: 'stackexchange',
//   displayName: 'Stack Exchange',
//   clientId: stackExchange.clientId,
//   clientSecret: stackExchange.clientSecret,
//   authorizationUrl: 'https://github.com/login/oauth/authorize',
//   tokenUrl: 'https://github.com/login/oauth/access_token',
//   userInfoUrl: 'https://api.github.com/user',
//   defaultScopes: 'user:email',
//   trustEmail: true,
//   syncMode: 'IMPORT',
// }, { provider });

export const realm = externalRealm.realm;

// const clusterRealm = new keycloak.Realm('cluster', {
//   realm: 'cluster',
//   displayName: cluster,
//   displayNameHtml: cluster,
//   userManagedAccess: true,
// }, { provider });

const webAppLogin = new keycloak.Role('webapp-login', {
	realmId: externalRealm.realm,
	name: 'webapp_login',
	description: 'Umbrella role for the ability to login to web apps',
}, { provider });

const webAppReaders = new keycloak.Group('webapp-readers', {
	realmId: externalRealm.realm,
	name: 'WebAppReaders',
}, { provider });

const webAppReaderRoles = new keycloak.GroupRoles('webapp-readers', {
	realmId: externalRealm.realm,
	groupId: webAppReaders.id,
	roleIds: [webAppLogin.id],
}, { provider });

const groupsScope = new keycloak.openid.ClientScope('groups', {
	realmId: externalRealm.realm,
	name: 'groups',
	description: 'User groups',
	includeInTokenScope: true,
}, { provider });

// TODO: Not sure if this is actually working yet...
const groupMembershipMapper = new keycloak.openid.GroupMembershipProtocolMapper('groups', {
	realmId: externalRealm.realm,
	claimName: 'groups',
	clientScopeId: groupsScope.id,
}, { provider });

const myUser = new keycloak.User('UnstoppableMango', {
	realmId: externalRealm.realm,
	username: 'unstoppablemango',
	email: me.email,
	emailVerified: true,
	enabled: true,
	firstName: me.firstName,
	lastName: me.lastName,
}, { provider });

const myMemberships = new keycloak.GroupMemberships('UnstoppableMango', {
	realmId: externalRealm.realm,
	groupId: webAppReaders.id,
	members: [myUser.username],
}, { provider });

export const externalRealmId = externalRealm.id;
// export const clusterRealmId = clusterRealm.id;
export const groupNames = [webAppReaders.name];
export const groupsScopeName = groupsScope.name;
export const groups = pulumi.all([webAppReaders.name, webAppReaders.id])
	.apply(([name, id]) => ({ [name]: id }));
