import { CronJob } from '@pulumi/kubernetes/batch/v1';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const actionsNs = Namespace.get('actions-runner-system', 'actions-runner-system', { provider });

const cleanActionsPvs = new CronJob('clean-actions-pvs', {
  metadata: {
    name: 'clean-actions-pvs',
    namespace: actionsNs.metadata.name,
  },
  spec: {
    schedule: '*/5 * * * *',
    jobTemplate: {
      spec: {
        selector: {
          matchLabels: {
            'kubernetes.io/job': 'clean-actions-pvs',
          },
        },
        template: {
          metadata: {
            labels: {
              'kubernetes.io/job': 'clean-actions-pvs',
            },
          },
          spec: {
            containers: [],
            volumes: [{
              name: 'scripts',
              configMap: {},
            }],
          },
        },
      },
    },
  },
}, { provider });
