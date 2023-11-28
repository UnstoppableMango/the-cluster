import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { ingressClass } from './apps/nginx-ingress';

const ns = new k8s.core.v1.Namespace('unifi', {
  metadata: { name: 'unifi' },
}, { provider });

const chart = new k8s.helm.v3.Chart('unifi', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    unifi: {
      image: {
        // tag: '',
      },
    }
  },
}, { provider });

const service = chart.getResource('v1/Service', 'unifi/unifi');

const ingress = new k8s.networking.v1.Ingress('unifi', {
  metadata: {
    name: 'unifi',
    namespace: ns.metadata.name,
  },
  spec: {
    ingressClassName: ingressClass,
    rules: [{
      host: 'unifi.thecluster.io',
      http: {
        paths: [{
          backend: {
            service: {
              name: service.metadata.name,
              port: {
                name: service.spec.ports[0].name,
              },
            },
          },
          path: '/',
          pathType: 'ImplementationSpecific',
        }],
      },
    }],
  },
});
