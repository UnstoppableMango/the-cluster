import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { issuer } from '@unmango/thecluster/apps/cert-manager';

const ns = new k8s.core.v1.Namespace('kong-system', {
  metadata: { name: 'kong-system' },
}, { provider });

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
      },
      udpProxy: {
        enabled: true,
      },
      admin: {
        enabled: true,
      },
      manager: {
        enabled: true,
      },
      portal: {
        enabled: true,
      },
      portalapi: {
        enabled: true,
      },
      // For hybrid control plane nodes
      cluster: {
        enabled: false,
      },
      // Assuming this is also for hybrid control plane nodes
      clustertelemetry: {
        enabled: false,
      },
      certificates: {
        enabled: true,
        clusterIssuer: issuer,
      },
      status: {
        enabled: true,
      },
      env: {
        admin_listen: 6969, // TODO
      },
    },
  },
}, { provider });
