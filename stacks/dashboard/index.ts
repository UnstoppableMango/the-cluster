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
        hosts: ['dashboard.thecluster.io'],
        customPaths: [{
          pathType: 'Prefix',
          path: '/*',
          backend: {
            service: {
              name: 'dashboard-kubernetes-dashboard',
              port: {
                number: 443,
              },
            },
          },
        }],
        annotations: {
          // https://github.com/STRRL/cloudflare-tunnel-ingress-controller/issues/11#issuecomment-1614542508
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'https',
          'cloudflare-tunnel-ingress-controller.strrl.dev/proxy-ssl-verify': 'off',

          // * Ingress .status.loadBalancer field was not updated with a hostname/IP address.
          // for more information about this error, see https://pulumi.io/xdv72s
          // https://github.com/pulumi/pulumi-kubernetes/issues/1812
          // https://github.com/pulumi/pulumi-kubernetes/issues/1810
          'pulumi.com/skipAwait': 'true',
        },
      },
    },
  },
});
