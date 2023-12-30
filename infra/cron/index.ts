import { CronJob } from '@pulumi/kubernetes/batch/v1';
import { Namespace, ServiceAccount } from '@pulumi/kubernetes/core/v1';
import { ClusterRole, ClusterRoleBinding } from '@pulumi/kubernetes/rbac/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const actionsNs = Namespace.get('actions-runner-system', 'actions-runner-system', { provider });

const pvPatcherRole = new ClusterRole('pv-patcher', {
  metadata: { name: 'pv-patcher' },
  rules: [{
    apiGroups: [''],
    resources: ['persistentvolumes'],
    verbs: ['get', 'list', 'patch'],
  }],
}, { provider });

const pvPatcherAccount = new ServiceAccount('pv-patcher', {
  metadata: {
    name: 'pv-patcher',
    namespace: actionsNs.metadata.name,
  },
  automountServiceAccountToken: true,
}, { provider });

const pvPatcherBinding = new ClusterRoleBinding('pv-patcher', {
  metadata: { name: 'pv-patcher' },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: pvPatcherRole.kind,
    name: pvPatcherRole.metadata.name,
  },
  subjects: [{
    kind: pvPatcherAccount.kind,
    name: pvPatcherAccount.metadata.name,
    namespace: actionsNs.metadata.name,
  }],
}, { provider });

const cleanActionsPvs = new CronJob('clean-actions-pvs', {
  metadata: {
    name: 'clean-actions-pvs',
    namespace: actionsNs.metadata.name,
  },
  spec: {
    schedule: '*/10 * * * *',
    successfulJobsHistoryLimit: 1,
    failedJobsHistoryLimit: 2,
    concurrencyPolicy: 'Forbid',
    jobTemplate: {
      spec: {
        template: {
          spec: {
            serviceAccountName: pvPatcherAccount.metadata.name,
            containers: [{
              name: 'work',
              image: 'ghcr.io/unstoppablemango/clean-pvs-cron-job:main',
            }],
            restartPolicy: 'Never',
          },
        },
      },
    },
  },
}, { provider });
