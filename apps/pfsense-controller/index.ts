import { Chart } from '@pulumi/kubernetes/helm/v3';
import { password, provider, username } from './config';
import { Namespace } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('pfsense-system', {
  metadata: { name: 'pfsense-system' },
}, { provider });

const chart = new Chart('pfsense-controller', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'pfsense-controller': {
      pfsense: {
        url: '192.168.1.1',
        username,
        password,
      },
    },
  },
}, { provider });
