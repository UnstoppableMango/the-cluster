import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';

const ns = new Namespace('arc-system', {
  metadata: { name: 'arc-system' },
});

const chart = new Chart('gha-runner-scale-set', {
  namespace: ns.metadata.name,
  chart: './',
  dependencyUpdate: true,
  values: {
    'gha-runner-scale-set-controller': {
      replicaCount: 2,
      securityContext: {
        capabilities: { drop: ['ALL'] },
        readOnlyRootFilesystem: true,
        runAsNonRoot: true,
        runAsUser: 1001,
      },
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    },
  },
});
