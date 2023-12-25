import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as random from '@pulumi/random';
import { clusterIssuers, databases, ingresses, provider, shared } from '@unmango/thecluster/cluster/from-stack';
import { auth, production, hosts, versions } from './config';
import { Namespace } from '@pulumi/kubernetes/core/v1';

const ns = Namespace.get('keycloak', shared.namespaces.keycloak, { provider });

const adminPassword = new random.RandomPassword('admin', {
  length: 48,
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

const service = chart.getResource(
  'v1/Service',
  'keycloak/keycloak',
);

export const clusterIp = service.spec.clusterIP;

const internalHosts = [hosts.internal, ...hosts.aliases.internal];
const internalIngress = new k8s.networking.v1.Ingress('internal', {
  metadata: {
    name: 'internal',
    namespace: ns.metadata.name,
    annotations: {
      'cert-manager.io/cluster-issuer': clusterIssuers.prod,
      'external-dns.alpha.kubernetes.io/hostname': [
        hosts.internal,
        ...hosts.aliases.internal,
      ].join(','),
    },
  },
  spec: {
    ingressClassName: ingresses.internal,
    rules: internalHosts.map(host => ({
      host,
      http: {
        paths: [{
          path: '/',
          pathType: 'ImplementationSpecific',
          backend: {
            service: {
              name: service.metadata.name,
              port: {
                name: service.spec.ports[0].name,
              },
            },
          },
        }],
      },
    })),
    tls: [{
      secretName: 'keycloak-internal-tls',
      hosts: internalHosts,
    }],
  },
}, { provider });

export { hosts };
export const hostname = hosts.external;
export const username = auth.adminUser;
export const password = adminPassword.result;
