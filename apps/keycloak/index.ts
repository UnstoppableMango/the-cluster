import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as random from '@pulumi/random';
import { apps, databases, ingresses, provider } from '@unmango/thecluster/cluster/from-stack';
import { auth, production, hosts, versions } from './config';

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
    dbHost: pulumi.interpolate`${databases.keycloak.clusterIp}`,
    dbPort: pulumi.interpolate`${databases.keycloak.port}`,
    dbUser: databases.keycloak.owner.username,
    dbPassword: databases.keycloak.owner.password,
    database: databases.keycloak.name,
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
        ingressClassName: ingresses.cloudflare,
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
apps.postgresqlHa.port
export { hosts };
export const hostname = hosts.external;
export const username = auth.adminUser;
export const password = adminPassword.result;
