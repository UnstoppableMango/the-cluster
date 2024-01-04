import * as k8s from '@pulumi/kubernetes';
import { CustomResourceOptions } from '@pulumi/pulumi';
import { clusterIssuers, ingresses, provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const loadBalancerIP = '192.168..1.87';

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
      service: {
        main: {
          type: 'LoadBalancer',
          loadBalancerIP,
          sharedKey: 'unifi-svc',
        },
        comm: {
          type: 'LoadBalancer',
          loadBalancerIP,
          sharedKey: 'unifi-svc',
        },
        stun: {
          type: 'LoadBalancer',
          loadBalancerIP,
          sharedKey: 'unifi-svc',
        },
        speedtest: {
          type: 'LoadBalancer',
          loadBalancerIP,
          sharedKey: 'unifi-svc',
        },
        guestportal: {
          type: 'LoadBalancer',
          loadBalancerIP,
          sharedKey: 'unifi-svc',
        },
      },
    },
  },
  transformations: [(obj: any, opts: CustomResourceOptions) => {
    if (obj.kind !== 'Deployment') return;
    const container = obj.spec.template.spec.containers[0];
    container.startupProbe = {
      ...container.startupProbe,
      failureThreshold: 60,
      initialDelaySeconds: 30,
      periodSeconds: 10,
    };
  }],
}, { provider });

const service = chart.getResource('v1/Service', 'unifi/unifi');
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
