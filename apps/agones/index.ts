import { helm } from '@pulumi/kubernetes';
import { Namespace } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('agones-system', {
  metadata: { name: 'agones-system' },
});

const serversNs = new Namespace('game-servers', {
  metadata: { name: 'game-servers' },
});

const chart = new helm.v4.Chart('agones', {
  namespace: ns.metadata.name,
  chart: 'agones',
  repositoryOpts: {
    repo: 'https://agones.dev/chart/stable',
  },
  values: {
    gameservers: {
      namespaces: [serversNs.metadata.name],
    },
    agones: {
      controller: {
        resources: {
          requests: {
            cpu: '10m',
            memory: '128Mi',
          },
          limits: {
            cpu: '100m',
            memory: '256Mi',
          },
        },
      },
    },
  },
});
