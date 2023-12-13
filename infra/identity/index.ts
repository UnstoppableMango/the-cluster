import * as pulumi from '@pulumi/pulumi';
import * as keycloak from '@pulumi/keycloak';
import { apps } from '@unmango/thecluster/cluster/from-stack';
import { cluster, google, me } from './config';

const provider = apps.keycloak.provider;

const externalRealm = new keycloak.Realm('external', {
  realm: 'external',
  displayName: 'THECLUSTER',
  displayNameHtml: 'THECLUSTER',
  registrationAllowed: false, // Maybe later
  registrationEmailAsUsername: false,
  rememberMe: true,
  verifyEmail: true,
}, { provider });

// const githubIdp = new keycloak.oidc.IdentityProvider('github', {
//   realm: externalRealm.id,
//   enabled: true,
//   alias: 'github',
//   displayName: 'GitHub',
//   clientId: github.clientId,
//   clientSecret: github.clientSecret,
//   authorizationUrl: 'https://github.com/login/oauth/authorize',
//   tokenUrl: 'https://github.com/login/oauth/access_token',
//   trustEmail: true,
//   syncMode: 'IMPORT',
// }, { provider: keycloakProvider });

const googleIdp = new keycloak.oidc.GoogleIdentityProvider('google', {
  realm: externalRealm.id,
  enabled: true,
  clientId: google.clientId,
  clientSecret: google.clientSecret,
  trustEmail: true,
  syncMode: 'IMPORT',
}, { provider });

export const realm = externalRealm.realm;

const clusterRealm = new keycloak.Realm('cluster', {
  realm: 'cluster',
  displayName: cluster,
  displayNameHtml: cluster,
  userManagedAccess: true,
}, { provider });

// const myUser = new keycloak.User('UnstoppableMango', {
//   realmId: realm,
//   enabled: true,
//   username: 'UnstoppableMango',
//   email: myEmail,
//   emailVerified: true,
//   federatedIdentities: [{
//     identityProvider: googleIdp.displayName,
//     userName: myGoogleId,
//     userId: myGoogleId,
//   }],
// }, { provider: keycloakProvider });

const webAppLogin = new keycloak.Role('webapp-login', {
  realmId: externalRealm.realm,
  name: 'webapp_login',
  description: 'Umbrella role for the ability to login to web apps',
}, { provider });

const webAppReaders = new keycloak.Group('webapp-readers', {
  realmId: externalRealm.realm,
  // I'm probably gonna get bit by putting spaces here
  // but there's no `displayName` or `description`
  name: 'Web App Readers',
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

// const groupMembershipMapper = new keycloak.openid.GroupMembershipProtocolMapper('groups', {
//   realmId: externalRealm.realm,
//   claimName: 'groups',
//   clientScopeId: groupsScope.id,
// }, { provider });

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

export const realms = {
  external: {
    id: externalRealm.realm,
  },
  cluster: {
    id: clusterRealm.realm,
  },
};

export const groupNames = [webAppReaders.name];
export const groupsScopeName = groupsScope.name;
export const groups = pulumi.all([webAppReaders.name, webAppReaders.id]).apply(([name, id]) => ({
  [name]: id,
}));
