import * as k8s from '@pulumi/kubernetes';
import * as charts from '@pulumi/crds/charts/v1alpha1/nginxIngress';
import { provider } from './clusters';
import { versions } from './config';

const ns = new k8s.core.v1.Namespace('internal-ingress', {
  metadata: { name: 'internal-ingress' },
});

export const ingressClass = 'nginx';

const internal = new charts.NginxIngress('internal', {
  metadata: {
    name: 'internal',
    namespace: ns.metadata.name,
  },
  spec: {
    controller: {
      image: {
        pullPolicy: 'IfNotPresent',
        repository: 'nginx/nginx-ingress',
        tag: `${versions.nginxIngress}-ubi`,
      },
      name: 'internal-nginx',
      kind: 'daemonset',
      ingressClass: {
        name: ingressClass,
        setAsDefaultIngress: false, // Consider in the future
      },
      service: {
        loadBalancerIp: '192.168.1.80',
      },
      nginxplus: false,
      enableCustomResources: true,
      enableCertManager: true,
      healthStatus: true,
      hostnetwork: false,
      enableSnippets: true,
    },
  },
}, { provider });
