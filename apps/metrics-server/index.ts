import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('metrics-server', {
  metadata: { name: 'metrics-server' },
});

const chart = new k8s.helm.v4.Chart('metrics-server', {
  chart: 'metrics-server',
  version: '3.12.1',
  repositoryOpts: {
    repo: 'https://kubernetes-sigs.github.io/metrics-server/',
  },
  namespace: ns.metadata.name,
});
