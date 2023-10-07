import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('dashboard', {
  metadata: { name: 'dashboard' },
});

const chart = new k8s.helm.v3.Chart('dashboard', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'kubernetes-dashboard': {
      nginx: { enabled: false },
      'cert-manager': { enabled: false },
      ingress: {
        enabled: true,
        className: 'cloudflare-tunnel',
        customPaths: [{
          pathType: 'Prefix',
          path: '/',
          backend: {
            service: {
              name: 'dashboard-kubernetes-dashboard',
              port: {
                number: 443,
              },
            },
          },
        }],
        hosts: ['dashboard.thecluster.io'],
      },
    },
  },
});
