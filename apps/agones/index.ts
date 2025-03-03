import { helm } from '@pulumi/kubernetes';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Config } from '@pulumi/pulumi';

const config = new Config();
const serverNamespaces = config.requireObject<string[]>('serverNamespaces');

const ns = new Namespace('agones-system', {
  metadata: { name: 'agones-system' },
});

const chart = new helm.v4.Chart('agones', {
  namespace: ns.metadata.name,
  chart: 'agones',
  repositoryOpts: {
    repo: 'https://agones.dev/chart/stable',
  },
  values: {
    gameservers: {
      namespaces: serverNamespaces,
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
      // https://shulker.jeremylvln.fr/latest/guide/getting-started/prerequisites.html#mandatory-softwares
      allocator: {
        install: true,
        service: {
          serviceType: 'ClusterIP',
        },
      },
    },
  },
});
