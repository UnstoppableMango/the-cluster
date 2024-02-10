import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { password, provider, username, versions } from './config';

const ns = new Namespace('pfsense-system', {
  metadata: { name: 'pfsense-system' },
}, { provider });

const chart = new Chart('pfsense-controller', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'pfsense-controller': {
      pfsense: {
        url: 'http://192.168.1.1',
        insecure: true,
        username,
        password,
      },
      config: {
        'controller-id': 'thecluster',
        enabled: true,
        plugins: {
          'metallb': { enabled: false },
          'haproxy-declarative': { enabled: false },
          'haproxy-ingress-proxy': { enabled: false },
          'pfsense-dns-services': { enabled: false },
          'pfsense-dns-ingresses': { enabeld: false },
          'pfsense-dns-haproxy-ingress-proxy': { enabled: false },
        },
      },
      image: {
        repository: 'docker.io/travisghansen/kubernetes-pfsense-controller',
        tag: versions.controller,
      },
    },
  },
}, { provider });
