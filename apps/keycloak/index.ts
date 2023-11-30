import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as random from '@pulumi/random';
import { provider } from './clusters';
import { auth, cluster, production, postgres, hostname, github, google } from './config';
import { rbdStorageClass } from './apps/ceph-csi';
import { ingressClass } from './apps/cloudflare-ingress';

const ns = new k8s.core.v1.Namespace('keycloak', {
  metadata: { name: 'keycloak' },
}, { provider });

const adminPassword = new random.RandomPassword('admin', {
  length: 24,
  special: false,
});

const postgresAdminPassword = new random.RandomPassword('postgres-admin', {
  length: 24,
  special: false,
});

const postgresPassword = new random.RandomPassword('postgres', {
  length: 24,
  special: false,
});

const chart = new k8s.helm.v3.Chart('keycloak', {
  path: './',
  namespace: ns.metadata.name,
  // https://github.com/bitnami/charts/tree/main/bitnami/keycloak/#parameters
  values: {
    keycloak: {
      global: {
        storageClass: rbdStorageClass,
      },
      auth: {
        ...auth,
        adminPassword: adminPassword.result,
      },
      production,
      proxy: 'edge',
      replicaCount: 2,
      // TODO: Figure out good values for these
      // resources: {
      //   limits: {
      //     cpu: '',
      //     mem: '',
      //   },
      //   requests: {
      //     cpu: '',
      //     mem: '',
      //   },
      // },
      ingress: {
        enabled: true,
        ingressClassName: ingressClass,
        pathType: 'Prefix',
        hostname,
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
  
          // * Ingress .status.loadBalancer field was not updated with a hostname/IP address.
          // for more information about this error, see https://pulumi.io/xdv72s
          // https://github.com/pulumi/pulumi-kubernetes/issues/1812
          // https://github.com/pulumi/pulumi-kubernetes/issues/1810
          'pulumi.com/skipAwait': 'true',
        },
      },
      pdb: { create: true },
      autoscaling: { enabled: false }, // One day...
      postgresql: {
        auth: {
          postgresPassword: postgresAdminPassword.result,
          username: postgres.username,
          password: postgresPassword.result,
          database: 'keycloak',
        },
        architecture: 'replication',
      },
    },
  },
}, { provider });

export { hostname }
export const password = adminPassword.result;
export const dbAdminPassword = postgresAdminPassword.result;
export const dbPassword = postgresPassword.result;

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

const githubIdp = new keycloak.oidc.IdentityProvider('github', {
  realm: externalRealm.id,
  enabled: true,
  alias: 'github',
  displayName: 'GitHub',
  clientId: github.clientId,
  clientSecret: github.clientSecret,
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  trustEmail: true,
  syncMode: 'IMPORT',
}, { provider: keycloakProvider });

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
