import * as k8s from '@pulumi/kubernetes';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from './clusters';
import { ingressClass, ip } from './apps/nginx-ingress';
import { provider as piholeProvider } from './apps/pihole';

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
      // 'cert-manager.io/issuer': 'selfsigned',
    },
  },
  spec: {
    ingressClassName: ingressClass,
    rules: [{
      host: 'unifi.thecluster.lan',
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
    tls: [{
      hosts: ['unifi.thecluster.lan'],
      secretName: 'unifi-tls',
    }],
  },
}, { provider });

const dnsRecord = new pihole.DnsRecord('unifi', {
  domain: 'unifi.thecluster.lan',
  ip,
}, { provider: piholeProvider });
