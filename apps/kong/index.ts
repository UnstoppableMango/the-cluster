import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as random from '@pulumi/random';
import { ingresses, provider, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import { hostnames } from './config';

const ns = new k8s.core.v1.Namespace('kong-system', {
  metadata: { name: 'kong-system' },
}, { provider });

export const ingressClass = 'kong';

const pgAdminPassword = new random.RandomPassword('postgres-password', {
  length: 32,
});

const pgKongPassword = new random.RandomPassword('postgres-kong', {
  length: 32,
});

const pgReplicationPassword = new random.RandomPassword('postgres-replication', {
  length: 32,
});

const pgSecret = new k8s.core.v1.Secret('postgres', {
  metadata: {
    name: 'kong-postgresql',
    namespace: ns.metadata.name,
  },
  stringData: {
    'postgres-password': pgAdminPassword.result,
    password: pgKongPassword.result,
    'replication-password': pgReplicationPassword.result,
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('kong', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: false,
  values: {
    // https://github.com/Kong/charts/tree/main/charts/kong#configuration
    kong: {
      proxy: {
        enabled: true,
        type: 'ClusterIP',
        ingress: {
          enabled: true,
          ingressClassName: ingresses.cloudflare,
          hostname: hostnames.proxy,
          tls: 'kong-kong-proxy-cert',
        },
      },
      admin: {
        enabled: true,
        type: 'ClusterIP',
        ingress: {
          enabled: true,
          ingressClassName: ingresses.cloudflare,
          hostname: hostnames.admin,
          tls: 'kong-kong-admin-cert',
        },
      },
      manager: {
        enabled: true,
        type: 'ClusterIP',
        ingress: {
          enabled: true,
          ingressClassName: ingresses.cloudflare,
          hostname: hostnames.manager,
        },
      },
      // For hybrid control plane nodes
      cluster: {
        enabled: false,
      },
      // Assuming this is also for hybrid control plane nodes
      clustertelemetry: {
        enabled: false,
      },
      status: {
        enabled: true,
        // tls: { enabled: true },
      },
      ingressController: {
        ingressClass,
        // Watches all when empty
        // watchNamespaces: [],
      },
      autoscaling: { enabled: true },
      podDistruptionBudget: { enabled: true },
      // certificates: {
      //   enabled: true,
      //   clusterIssuer: clusterIssuers.selfSigned,
      //   proxy: {
      //     commonName: 'proxy.kong.thecluster.lan',
      //     dnsNames: ['proxy.kong.thecluster.lan'],
      //   },
      //   admin: {
      //     commonName: 'admin.kong.thecluster.lan',
      //     dnsNames: ['admin.kong.thecluster.lan'],
      //   },
      //   cluster: { enabled: false },
      // },
      // https://github.com/bitnami/charts/tree/main/bitnami/postgresql
      postgresql: {
        // Worth noting this uses an old postgres version
        // https://github.com/Kong/charts/blob/05ce54f3f5399174f37e0c8cae0b38e0b620e5f5/charts/kong/values.yaml#L702
        enabled: true,
        global: {
          storageClass: storageClasses.rbd,
        },
        auth: {
          existingSecret: pgSecret.metadata.name,
        },
        architecture: 'replicated',
        replication: {
          applicationName: 'kong',
        },
      },
    },
  },
  transformations: [
    // (obj: any, opts: pulumi.CustomResourceOptions) => {
    //   opts.ignoreChanges = ['data.["tls.crt"]', 'data.["tls.key"]', 'webhooks.[*].clientConfig.caBundle'];
    // },
    (obj: any, opts: pulumi.CustomResourceOptions) => {
      if (obj.kind !== 'Ingress') return;
      obj.metadata.annotations = { 'pulumi.com/skipAwait': 'true' };
    },
  ],
}, { provider });

export { hostnames };
