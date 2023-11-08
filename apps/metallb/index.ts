import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('metallb-system', {
  metadata: { name: 'metallb-system' },
});

const chart = new k8s.helm.v3.Chart('metallb', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: true,
  values: {
    metallb: {
      // The CRDs are templated and a pain to install other ways
      crds: { enabled: true },
      loadBalancerClass: 'metallb',
    },
  },
});

const pool = new k8s.apiextensions.CustomResource('primary', {
  apiVersion: 'metallb.io/v1beta1',
  kind: 'IPAddressPool',
  metadata: {
    name: 'primary',
    namespace: ns.metadata.name,
  },
  spec: {
    addresses: ['192.168.1.98/32'],
  },
}, { dependsOn: chart.ready });
