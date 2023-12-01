import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { hosts } from './config';
import { ingressClass } from './apps/cloudflare-ingress';

const ns = new k8s.core.v1.Namespace('dashboard', {
  metadata: { name: 'dashboard' },
}, { provider });

const chart = new k8s.helm.v3.Release('dashboard', {
  name: 'dashboard',
  chart: './',
  namespace: ns.metadata.name,
  values: {
    'kubernetes-dashboard': {
      nginx: { enabled: false },
      'cert-manager': { enabled: false },
      'metrics-server': { enabled: false },
      app: {
        ingress: {
          hosts,
          ingressClassName: ingressClass,
          pathType: 'Prefix',
          issuer: { scope: 'disabled' },
          // paths: { web: '/*' },
          // paths: { api: '/api/*' },
          // paths: {
          //   web: '/*',
          //   api: '/api/*',
          // },
          annotations: {
            'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
            'cloudflare-tunnel-ingress-controller.strrl.dev/ssl-verify': 'false',
          },
        },
        settings: {
          global: {
            clusterName: 'THECLUSTER',
            // Default values: https://github.com/kubernetes/dashboard/blob/fdc83e5623f44fe52c5c94d245fd490a0b94a60d/charts/helm-chart/kubernetes-dashboard/values.yaml#L60
            itemsPerPage: 10,
            logsAutoRefreshTimeInterval: 5,
            resourceAutoRefreshTimeInterval: 5,
            disableAccessDeniedNotifications: false,
          },
        },
      },
      api: {
        image: { tag: 'latest' },
        containers: {
          args: ['--enable-skip-login'],
        },
      },
      web: {
        image: { tag: 'latest' },
      },
    },
  },
}, { provider, ignoreChanges: ['checksum'] });

export const namespace = ns.metadata.name;
export const service = 'dashboard-kubernetes-dashboard-web';
