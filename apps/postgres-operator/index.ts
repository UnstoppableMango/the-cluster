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
  values: {
    configGeneral: {
      enable_crd_registration: true,
    },
    configLoadBalancer: {
      db_hosted_zone: 'pg.thecluster.io',
      enable_master_load_balancer: true,
    },
  },
});

const uiChart = new Chart('ui', {
  chart: 'postgres-operator-ui',
  repositoryOpts: {
    repo: 'https://opensource.zalando.com/postgres-operator/charts/postgres-operator-ui',
  },
  namespace: ns.metadata.name,
  values: {
    ingress: {
      enabled: false, // Need to setup oauth-proxy in front of this
      ingressClassName: 'thecluster-io',
      hosts: [{
        host: 'pgo-admin.thecluster.io',
        paths: ['/'],
      }],
    },
  },
});
