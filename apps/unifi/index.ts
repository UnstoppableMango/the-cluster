import * as k8s from '@pulumi/kubernetes';
import { clusterIssuers, ingresses, provider } from '@unmango/thecluster/cluster/from-stack';

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
    annotations: {
      'pulumi.com/skipAwait': 'true',
      'cert-manager.io/cluster-issuer': clusterIssuers.staging,
    },
  },
  spec: {
    ingressClassName: ingresses.internal,
    rules: [{
      host: 'unifi.lan.thecluster.io',
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
    }],
    tls: [{
      hosts: ['unifi.lan.thecluster.io'],
      secretName: 'unifi-tls',
    }],
  },
}, { provider });
