import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { clusterIssuers } from '@unmango/thecluster/apps/cert-manager';
import { ingressClass as cloudflareIngress } from '@unmango/thecluster/apps/cloudflare-ingress';
import { internalClass, internalClass as nginxIngress } from '@unmango/thecluster/apps/nginx-ingress';
import { hostnames } from './config';

const ns = new k8s.core.v1.Namespace('kong-system', {
  metadata: { name: 'kong-system' },
}, { provider });

export const ingressClass = 'kong';

const chart = new k8s.helm.v3.Chart('kong', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: false,
  values: {
    // https://github.com/Kong/charts/tree/main/charts/kong#configuration
    kong: {
      postgresql: { enabled: true },
      proxy: {
        enabled: true,
        type: 'ClusterIP',
        ingress: {
          enabled: true,
          ingressClassName: internalClass,
          hostname: hostnames.proxy,
          tls: 'proxy-tls',
        },
      },
      udpProxy: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: internalClass,
          hostname: hostnames.udpProxy,
          tls: 'udpProxy-tls',
        },
      },
      admin: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: internalClass,
          hostname: hostnames.admin,
          tls: 'admin-tls',
        },
      },
      manager: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: internalClass,
          hostname: hostnames.manager,
          tls: 'manager-tls',
        },
      },
      portal: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: internalClass,
          hostname: hostnames.portal,
          tls: 'portal-tls',
        },
      },
      portalapi: {
        enabled: true,
        ingress: {
          enabled: true,
          ingressClassName: internalClass,
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
          ingressClassName: internalClass,
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
  },
}, { provider });

export { hostnames };
