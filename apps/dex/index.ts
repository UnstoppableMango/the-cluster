import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { apps, ingresses, provider, realms } from '@unstoppablemango/thecluster/cluster/from-stack';
import { publicHost, internalHost, versions } from './config';

const client = new keycloak.openid.Client('dex', {
  realmId: realms.external.id,
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
}, { provider: apps.keycloak.provider });

const audMapper = new keycloak.openid.AudienceProtocolMapper('dex', {
  realmId: realms.external.id,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: apps.keycloak.provider });

const adminGroup = new keycloak.Group('k8s-admin', {
  realmId: realms.external.id,
  name: 'k8s-admin',
}, { provider: apps.keycloak.provider });

const adminRole = new keycloak.Role('k8s-admin', {
  realmId: realms.external.id,
  name: 'admin',
}, { provider: apps.keycloak.provider });

const adminGroupRoles = new keycloak.GroupRoles('admin', {
  realmId: realms.external.id,
  groupId: adminGroup.id,
  roleIds: [adminRole.id],
}, { provider: apps.keycloak.provider });

const groupMapper = new keycloak.openid.UserClientRoleProtocolMapper('kubernetes', {
  realmId: realms.external.id,
  name: 'groups',
  claimName: 'groups',
  clientId: client.id,
  clientRolePrefix: 'kubernetes:',
  addToIdToken: true,
}, { provider: apps.keycloak.provider });

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
        issuer: pulumi.interpolate`https://${apps.keycloak.hostname}/realms/${realms.external.id}`,
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
            issuer: pulumi.interpolate`https://${apps.keycloak.hostname}/realms/${realms.external.id}`,
            clientID: client.clientId,
            clientSecret: client.clientSecret,
            redirectURI: pulumi.interpolate`https://${publicHost}/callback`,
          },
        }],
      },
      ingress: {
        enabled: true,
        className: ingresses.cloudflare,
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
    name: pulumi.interpolate`https://${apps.keycloak.hostname}/realms/external#d0a4459b-3507-489a-8b15-bf1489645acf`,
  }],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
}, { provider });

export const clientId = client.clientId;
export const clientSecret = client.clientSecret;
