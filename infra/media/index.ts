import { Ingress } from '@pulumi/kubernetes/networking/v1';
import { apps, clusterIssuers, ingresses, provider, shared } from '@unstoppablemango/thecluster/cluster/from-stack';
import { hosts } from './config';

const ingress = new Ingress('media', {
  metadata: {
    name: 'media',
    namespace: shared.namespaces.media,
    annotations: {
      'nginx.org/websocket-services': apps.deemix.service,
      'cert-manager.io/cluster-issuer': clusterIssuers.root,
      'external-dns.alpha.kubernetes.io/hostname': [
        hosts.internal,
        // ...hosts.aliases.internal,
      ].join(','),
    },
  },
  spec: {
    ingressClassName: ingresses.internal,
    rules: [
      {
        host: hosts.internal,
        http: {
          paths: [
            {
              path: '/deemix',
              pathType: 'ImplementationSpecific',
              backend: {
                service: {
                  name: apps.deemix.service,
                  port: {
                    name: 'http',
                  },
                },
              },
            },
            {
              path: '/',
              pathType: 'ImplementationSpecific',
              backend: {
                service: {
                  name: apps.filebrowser.service,
                  port: {
                    name: 'http',
                  },
                },
              },
            },
          ],
        },
      },
      {
        host: 'deemix.lan.thecluster.io',
        http: {
          paths: [{
            pathType: 'ImplementationSpecific',
            backend: {
              service: {
                name: apps.deemix.service,
                port: {
                  name: 'http',
                },
              },
            },
          }],
        },
      },
      {
        host: 'plex.lan.thecluster.io',
        http: {
          paths: [{
            pathType: 'ImplementationSpecific',
            backend: {
              service: {
                name: apps.plex.service,
                port: {
                  name: 'http',
                },
              },
            },
          }],
        },
      },
    ],
    tls: [
      {
        hosts: [hosts.internal],
        secretName: 'media-certs',
      },
      {
        hosts: ['deemix.lan.thecluster.io'],
        secretName: 'deemix-certs',
      }
    ],
  },
}, { provider });
