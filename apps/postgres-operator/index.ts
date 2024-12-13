import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';

const ns = new Namespace('postgres-operator', {
  metadata: { name: 'postgres-operator' },
});

const chart = new Chart('operator', {
  chart: 'postgres-operator',
  repositoryOpts: {
    repo: 'https://opensource.zalando.com/postgres-operator/charts/postgres-operator',
  },
  namespace: ns.metadata.name,
});

const uiChart = new Chart('ui', {
  chart: 'postgres-operator-ui',
  repositoryOpts: {
    repo: 'https://opensource.zalando.com/postgres-operator/charts/postgres-operator-ui',
  },
  namespace: ns.metadata.name,
});
