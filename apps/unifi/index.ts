import * as k8s from '@pulumi/kubernetes';
import * as pihole from '@unmango/pulumi-pihole';
import { clusterIssuers, ingresses, provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { versions } from './config';

const loadBalancerIP = '192.168..1.87';

const ns = new k8s.core.v1.Namespace('unifi', {
  metadata: { name: 'unifi' },
}, { provider });

// const chart = new k8s.helm.v3.Chart('unifi', {
//   path: './',
//   namespace: ns.metadata.name,
//   values: {
//     unifi: {
//       image: {
//         // tag: '',
//       },
//     }
//   },
// }, { provider });

// const service = chart.getResource('v1/Service', 'unifi/unifi');

const pvc = new k8s.core.v1.PersistentVolumeClaim('unifi', {
  metadata: {
    name: 'unifi',
    namespace: ns.metadata.name,
  },
  spec: {
    storageClassName: storageClass,
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '10Gi',
      },
    },
  },
}, { provider });

const deployment = new k8s.apps.v1.Deployment('unifi', {
  metadata: {
    name: 'unifi',
    namespace: ns.metadata.name,
  },
  spec: {
    selector: {
      matchLabels: {
        app: 'unifi',
      },
    },
    template: {
      metadata: {
        name: 'unifi',
        labels: {
          app: 'unifi',
        },
      },
      spec: {
        securityContext: {
          runAsNonRoot: true,
          runAsUser: 999,
          runAsGroup: 999,
        },
        containers: [{
          name: 'unifi',
          image: `jacobalberty/unifi:${versions.unifi}`,
          env: [
            { name: 'TZ', value: 'America/Chicago' },
          ],
          ports: [
            {
              name: 'device',
              containerPort: 8080,
            },
            {
              name: 'web',
              containerPort: 8443,
            },
            {
              name: 'stun',
              containerPort: 3478,
              protocol: 'UDP',
            },
            {
              name: 'portal-https',
              containerPort: 8843,
            },
            {
              name: 'portal-http',
              containerPort: 8880,
            },
            {
              name: 'speed-test',
              containerPort: 6789,
            },
          ],
          volumeMounts: [{
            name: 'unif',
            mountPath: '/unifi',
          }],
        }],
        volumes: [{
          name: 'unifi',
          persistentVolumeClaim: {
            claimName: pvc.metadata.name,
          },
        }],
      },
    },
  },
}, { provider });

const ingress = new k8s.networking.v1.Ingress('unifi', {
  metadata: {
    name: 'unifi',
    namespace: ns.metadata.name,
    annotations: {
      'pulumi.com/skipAwait': 'true',
      'cert-manager.io/cluster-issuer': clusterIssuers.staging,
      'nginx.org/ssl-services': service.metadata.name,
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
