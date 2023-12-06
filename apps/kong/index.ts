import * as k8s from '@pulumi/kubernetes';
import * as random from '@pulumi/random';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { clusterIssuers } from '@unmango/thecluster/apps/cert-manager';
import { ingressClass as cloudflareIngress } from '@unmango/thecluster/apps/cloudflare-ingress';
import { internalClass as nginxIngress, loadBalancerIp } from '@unmango/thecluster/apps/nginx-ingress';
import { rbdStorageClass } from '@unmango/thecluster/apps/ceph-csi';
import { provider as piholeProvider } from '@unmango/thecluster/apps/pihole';
import { hostnames, versions } from './config';

const ns = new k8s.core.v1.Namespace('kong-system', {
  metadata: { name: 'kong-system' },
}, { provider });

export const ingressClass = 'kong';

const pgPassword = new random.RandomPassword('postgresql', {
  length: 32,
});

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
          ingressClassName: nginxIngress,
          hostname: hostnames.proxy,
          tls: 'proxy-tls',
        },
      },
      udpProxy: {
        enabled: true,
      },
      admin: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: nginxIngress,
          hostname: hostnames.admin,
          tls: 'admin-tls',
        },
      },
      manager: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: nginxIngress,
          hostname: hostnames.manager,
          tls: 'manager-tls',
        },
      },
      portal: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: nginxIngress,
          hostname: hostnames.portal,
          tls: 'portal-tls',
        },
      },
      portalapi: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: nginxIngress,
          hostname: hostnames.portalapi,
          tls: 'portalapi-tls',
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
        ingress: {
          enabled: true,
          ingressClassName: nginxIngress,
          hostname: hostnames.status,
          tls: 'status-tls',
        },
      },
      ingressController: {
        ingressClass,
        // Watches all when empty
        // watchNamespaces: [],
      },
      autoscaling: { enabled: true },
      podDistruptionBudget: { enabled: true },
      podSecurityPolicy: { enabled: true },
      certificates: {
        enabled: true,
        clusterIssuer: clusterIssuers.selfSigned,
      },
    },
    // https://github.com/bitnami/charts/tree/main/bitnami/postgresql
    postgresql: {
      // Worth noting this uses an old postgres version
      // https://github.com/Kong/charts/blob/05ce54f3f5399174f37e0c8cae0b38e0b620e5f5/charts/kong/values.yaml#L702
      enabled: true,
      global: {
        storageClass: rbdStorageClass,
      },
      auth: {
        password: pgPassword.result,
      },
      architecture: 'replicated',
      replication: {
        applicationName: 'kong',
      },
    },
  },
}, { provider });

const operator = new k8s.yaml.ConfigGroup('gateway-operator', {
  files: [
    `https://docs.konghq.com/assets/gateway-operator/${versions.gatewayOperator}/crds.yaml`,
    `https://docs.konghq.com/assets/gateway-operator/${versions.gatewayOperator}/default.yaml`,
  ],
}, { provider, dependsOn: chart.ready })

export { hostnames };

const dns = Object.entries(hostnames)
  .map(([name, host]) => new pihole.DnsRecord(name, {
    domain: host,
    ip: loadBalancerIp,
  }, { provider: piholeProvider, dependsOn: chart.ready }));
