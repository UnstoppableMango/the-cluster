import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('metallb-system', {
  metadata: {
    name: 'metallb-system',
    labels: {
      // https://github.com/metallb/metallb/issues/1457
      // https://github.com/metallb/metallb/pull/1467
      'pod-security.kubernetes.io/audit': 'privileged',
      'pod-security.kubernetes.io/enforce': 'privileged',
      'pod-security.kubernetes.io/warn': 'privileged',
    },
  },
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

const sideroPool = new k8s.apiextensions.CustomResource('sidero', {
  apiVersion: 'metallb.io/v1beta1',
  kind: 'IPAddressPool',
  metadata: {
    name: 'sidero',
    namespace: ns.metadata.name,
  },
  spec: {
    addresses: ['192.168.1.98/32'],
    autoAssign: true,
  },
}, { dependsOn: chart.ready });

const advertisement = new k8s.apiextensions.CustomResource('primary', {
  apiVersion: 'metallb.io/v1beta1',
  kind: 'L2Advertisement',
  metadata: {
    name: 'sidero',
    namespace: ns.metadata.name,
  },
  spec: {
    ipAddressPools: [sideroPool.metadata.name],
  },
}, { dependsOn: chart.ready });

export const sideroPoolName = sideroPool.metadata.name;
