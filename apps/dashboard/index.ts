import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { Buffer } from 'buffer';

const config = new pulumi.Config();

const ns = new k8s.core.v1.Namespace('dashboard', {
  metadata: { name: 'dashboard' },
});

const serviceAccount = new k8s.core.v1.ServiceAccount('admin', {
  metadata: {
    name: 'admin',
    namespace: ns.metadata.name,
  },
});

const chart = new k8s.helm.v3.Chart('dashboard', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'kubernetes-dashboard': {
      // v3 config
      // nginx: { enabled: false },
      // 'cert-manager': { enabled: false },
      serviceAccount: {
        create: false,
        name: serviceAccount.metadata.name,
      },
      ingress: {
        enabled: true,
        className: 'cloudflare-tunnel',
        hosts: [`${config.require('subdomain')}.thecluster.io`],
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

const adminSecret = new k8s.core.v1.Secret('ui-token', {
  metadata: {
    name: 'ui-token',
    namespace: ns.metadata.name,
    annotations: {
      'kubernetes.io/service-account.name': serviceAccount.metadata.name,
    }
  },
  type: 'kubernetes.io/service-account-token',
}, { dependsOn: chart.ready });

const clusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding('admin', {
  metadata: { name: 'dashboard-admin' },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
  subjects: [{
    kind: 'ServiceAccount',
    name: serviceAccount.metadata.name,
    namespace: ns.metadata.name,
  }],
});

const btoa = (x: string) => Buffer.from(x, 'base64').toString('binary');
export const uiToken = adminSecret.data['token'].apply(btoa);
