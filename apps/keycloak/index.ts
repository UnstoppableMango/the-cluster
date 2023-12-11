import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as random from '@pulumi/random';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { rbdStorageClass } from '@unmango/thecluster/apps/ceph-csi';
import { ingressClass } from '@unmango/thecluster/apps/cloudflare-ingress';
import { user as dbUser, hostname as dbHost, port as dbPort, database } from '@unmango/thecluster/dbs/keycloak';
import { auth, cluster, production, hosts, github, google, versions } from './config';

const ns = new k8s.core.v1.Namespace('keycloak', {
  metadata: { name: 'keycloak' },
}, { provider });

const adminPassword = new random.RandomPassword('admin', {
  length: 24,
  special: false,
});

const secret = new k8s.core.v1.Secret('keycloak', {
  metadata: {
    name: 'keycloak',
    namespace: ns.metadata.name,
  },
  stringData: {
    adminPassword: adminPassword.result,
    dbHost: pulumi.interpolate`${dbHost}`,
    dbPort: pulumi.interpolate`${dbPort}`,
    dbUser: dbUser.username,
    dbPassword: dbUser.password,
    database,
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('keycloak', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/bitnami/charts/tree/main/bitnami/keycloak/#parameters
    keycloak: {
      image: {
        registry: 'docker.io',
        repository: 'bitnami/keycloak',
        tag: versions.keycloak,
      },
      auth: {
        ...auth,
        existingSecret: secret.metadata.name,
        passwordSecretKey: 'adminPassword',
      },
      production,
      proxy: 'edge',
      containerPorts: {
        http: 8080,
        https: 8443,
        infinispan: 7800,
      },
      podSecurityContext: { enabled: true },
      containerSecurityContext: { enabled: true },
      service: {
        type: 'ClusterIP',
        // clusterIP: '',
        http: {
          enabled: true,
        },
        ports: {
          http: 80,
          https: 443,
        },
      },
      ingress: {
        enabled: true,
        ingressClassName: ingressClass,
        pathType: 'Prefix',
        hostname: hosts.external,
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
          'pulumi.com/skipAwait': 'true',
        },
      },
      pdb: { create: true },
      autoscaling: { enabled: true },
      metrics: { enabled: true },
      postgresql: { enabled: false },
      externalDatabase: {
        existingSecret: secret.metadata.name,
        existingSecretHostKey: 'dbHost',
        existingSecretPortKey: 'dbPort',
        existingSecretUserKey: 'dbUser',
        existingSecretDatabaseKey: 'database',
        existingSecretPasswordKey: 'dbPassword',
      },
    },
  },
}, { provider });

export const hostname = hosts.external;
export const password = adminPassword.result;

const keycloakProvider = new keycloak.Provider(cluster, {
  url: `https://${hostname}`,
  username: 'admin',
  password: adminPassword.result,
  clientId: 'admin-cli',
}, { dependsOn: chart.ready });

const externalRealm = new keycloak.Realm('external', {
  realm: 'external',
  displayName: 'THECLUSTER',
  displayNameHtml: 'THECLUSTER',
  registrationAllowed: false, // Maybe later
  registrationEmailAsUsername: false,
  rememberMe: true,
  verifyEmail: true,
}, { provider: keycloakProvider });

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
}, { provider: keycloakProvider });

export const realm = externalRealm.realm;

const clusterRealm = new keycloak.Realm('cluster', {
  realm: 'cluster',
  displayName: cluster,
  displayNameHtml: cluster,
  userManagedAccess: true,
}, { provider: keycloakProvider });

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
