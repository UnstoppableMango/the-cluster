import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('metrics-server', {
  metadata: { name: 'metrics-server' },
});

const chart = new k8s.helm.v3.Chart('metrics-server', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'metrics-server': {
      // https://github.com/kubernetes-sigs/metrics-server/issues/196#issuecomment-451061841
      // args: ['--kubelet-insecure-tls'],
    },
  },
});
