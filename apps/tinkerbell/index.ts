import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const ns = new Namespace('tinkerbell', {
  metadata: { name: 'tinkerbell' },
}, { provider });

const chart = new Chart('tinkerbell', {
  namespace: ns.metadata.name,
  path: './',
  values: {
    'tinkerbell': {},
  },
}, { provider });
