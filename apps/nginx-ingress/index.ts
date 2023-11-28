import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as charts from '@pulumi/crds/charts/v1alpha1/nginxIngress';
import versions from './versions';

const ns = new k8s.core.v1.Namespace('internal-ingress', {
  metadata: { name: 'internal-ingress' },
});

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
        tag: versions.nginxIngress,
      },
      name: 'internal-nginx',
      kind: 'daemonset',
      ingressClass: 'nginx',
      nginxplus: false,
      setAsDefaultIngress: false, // Consider in the future
      enableCertManager: true,
      healthStatus: true,
    },
  },
});
