import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { stack, loadBalancerClass } from './config';

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
}, { provider });

const chart = new k8s.helm.v3.Chart('metallb', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: true,
  values: {
    metallb: {
      // The CRDs are templated and a pain to install other ways
      crds: { enabled: true },
      loadBalancerClass,
    },
  },
}, { provider });

let addresses: string | undefined = undefined;
let pool: k8s.apiextensions.CustomResource | undefined = undefined;
let advertisement: k8s.apiextensions.CustomResource | undefined = undefined;

if (stack === 'rosequartz') {
  // TODO: this and the advertisement should probably live in the sidero stack
  addresses = '192.168.1.98/32';
  pool = new k8s.apiextensions.CustomResource('sidero', {
    apiVersion: 'metallb.io/v1beta1',
    kind: 'IPAddressPool',
    metadata: {
      name: 'sidero',
      namespace: ns.metadata.name,
    },
    spec: {
      addresses: ['192.168.1.98/32'],
      autoAssign: true,
      avoidBuggyIPs: true,
      serviceAllocation: {
        namespaces: ['sidero-system'],
      },
    },
  }, { provider, dependsOn: chart.ready });

  advertisement = new k8s.apiextensions.CustomResource('primary', {
    apiVersion: 'metallb.io/v1beta1',
    kind: 'L2Advertisement',
    metadata: {
      name: 'sidero',
      namespace: ns.metadata.name,
    },
    spec: {
      ipAddressPools: [pool.metadata.name],
    },
  }, { provider, dependsOn: chart.ready });
}

if (stack === 'pinkdiamond') {
  addresses = '192.168.1.80-192.168.1.89';
  pool = new k8s.apiextensions.CustomResource('pool', {
    apiVersion: 'metallb.io/v1beta1',
    kind: 'IPAddressPool',
    metadata: {
      name: 'pool',
      namespace: ns.metadata.name,
    },
    spec: {
      addresses: ['192.168.1.80-192.168.1.89'],
      autoAssign: true,
      avoidBuggyIPs: true,
    },
  }, { provider, dependsOn: chart.ready });

  advertisement = new k8s.apiextensions.CustomResource('advertisement', {
    apiVersion: 'metallb.io/v1beta1',
    kind: 'L2Advertisement',
    metadata: {
      name: 'advertisement',
      namespace: ns.metadata.name,
    },
    spec: {
      ipAddressPools: [pool.metadata.name],
    },
  }, { provider, dependsOn: chart.ready });
}

export const poolName = pool?.metadata.name
export const advertisementName = advertisement?.metadata.name;
export { loadBalancerClass, addresses };
