import * as pulumi from '@pulumi/pulumi';
import { AccessToken } from '@pulumi/pulumiservice';
import { Namespace, Secret, ServiceAccount } from '@pulumi/kubernetes/core/v1';
import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { ClusterRoleBinding } from '@pulumi/kubernetes/rbac/v1';

const sa = new ServiceAccount('pulumi-operator', {});

const crb = new ClusterRoleBinding('pulumi-operator:system:auth-delegator', {
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'system:auth-delegator',
  },
  subjects: [{
    kind: 'ServiceAccount',
    name: sa.metadata.name,
    namespace: sa.metadata.namespace,
  }],
});

const ns = new Namespace('stacks', {
  metadata: { name: 'thecluster-stacks' },
});

const secretKey = 'accessToken';

const accessToken = new AccessToken(`pulumi-operator-${pulumi.getStack()}`, {
  description: 'Token for the pulumi-operator in THECLUSTER to deploy stacks',
});

const secret = new Secret('pulumi-operator', {
  metadata: { namespace: ns.metadata.name },
  stringData: {
    [secretKey]: accessToken.value,
  },
});

const projectRepo = 'https://github.com/UnstoppableMango/the-cluster';

const stacks = new CustomResource('stacks', {
  apiVersion: 'pulumi.com/v1',
  kind: 'Stack',
  spec: {
    serviceAccountName: sa.metadata.name,
    projectRepo,
    repoDir: 'infra/stacks',
    branch: 'main',
    shallow: true,
    stack: 'pinkdiamond',
    refresh: true,
    envRefs: {
      PULUMI_ACCESS_TOKEN: {
        type: 'Secret',
        secret: {
          name: secret.metadata.name,
          key: secretKey,
        },
      },
    },
  },
}, { dependsOn: [sa, crb, secret] });
