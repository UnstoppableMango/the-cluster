import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { provider } from './clusters';
import {  publicHost, internalHost, versions } from './config';
import { ingressClass } from './apps/cloudflare-ingress';
import { provider as keycloakProvider, realm, hostname as keycloakHost } from './apps/keycloak';

const client = new keycloak.openid.Client('dex', {
  realmId: realm,
  enabled: true,
  name: 'Dex',
  clientId: 'dex',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    pulumi.interpolate`https://${publicHost}/callback`,
    pulumi.interpolate`https://${internalHost}/callback`,
    'http://localhost:8000',
    'http://localhost:18000',
  ],
}, { provider: keycloakProvider });

const audMapper = new keycloak.openid.AudienceProtocolMapper('dex', {
  realmId: realm,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const adminGroup = new keycloak.Group('k8s-admin', {
  realmId: realm,
  name: 'k8s-admin',
}, { provider: keycloakProvider });

const adminRole = new keycloak.Role('k8s-admin', {
  realmId: realm,
  name: 'admin',
}, { provider: keycloakProvider });

const adminGroupRoles = new keycloak.GroupRoles('admin', {
  realmId: realm,
  groupId: adminGroup.id,
  roleIds: [adminRole.id],
}, { provider: keycloakProvider });

const groupMapper = new keycloak.openid.UserClientRoleProtocolMapper('kubernetes', {
  realmId: realm,
  name: 'groups',
  claimName: 'groups',
  clientId: client.id,
  clientRolePrefix: 'kubernetes:',
  addToIdToken: true,
}, { provider: keycloakProvider });

const crds = new k8s.yaml.ConfigGroup('crds', {
  files: [
    'authcodes',
    'authrequests',
    'connectors',
    'devicerequests',
    'devicetokens',
    'oauth2clients',
    'offlinesessionses',
    'passwords',
    'refreshtokens',
    'signingkeies',
  ].map(x => `https://raw.githubusercontent.com/dexidp/dex/${versions.dex}/scripts/manifests/crds/${x}.yaml`),
}, { provider });

const ns = new k8s.core.v1.Namespace('dex', {
  metadata: { name: 'dex' },
}, { provider });

const chart = new k8s.helm.v3.Chart('dex', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    dex: {
      config: {
        issuer: pulumi.interpolate`https://${keycloakHost}/realms/${realm}`,
        storage: {
          type: 'kubernetes',
          config: {
            inCluster: true,
          },
        },
        connectors: [{
          type: 'oidc',
          id: 'keycloak',
          name: 'Keycloak',
          config: {
            issuer: pulumi.interpolate`https://${keycloakHost}/realms/${realm}`,
            clientID: client.clientId,
            clientSecret: client.clientSecret,
            redirectURI: pulumi.interpolate`https://${publicHost}/callback`,
          },
        }],
      },
      ingress: {
        enabled: true,
        className: ingressClass,
        hosts: [{
          host: publicHost,
          paths: [{
            path: '/',
            pathType: 'Prefix',
          }],
        }],
        annotations: {
          'pulumi.com/skipAwait': 'true',
        },
      },
    },
  },
}, { provider });

const clusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding('oidc-cluster-admin', {
  metadata: { name: 'oidc-cluster-admin' },
  subjects: [{
    kind: 'Group',
    name: pulumi.interpolate`https://${keycloakHost}/realms/external#d0a4459b-3507-489a-8b15-bf1489645acf`,
  }],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
}, { provider });

export const clientId = client.clientId;
export const clientSecret = client.clientSecret;
