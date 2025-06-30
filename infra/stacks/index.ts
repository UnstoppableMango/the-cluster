import * as pulumi from '@pulumi/pulumi';
import { AccessToken } from '@pulumi/pulumiservice';
import { Namespace, Secret, ServiceAccount } from '@pulumi/kubernetes/core/v1';
import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { ClusterRoleBinding, RoleBinding } from '@pulumi/kubernetes/rbac/v1';
import { versions } from './config';

const ns = new Namespace('thecluster-stacks', {
  metadata: { name: 'thecluster-stacks' },
});

const sa = new ServiceAccount('pulumi-operator', {
  metadata: { namespace: ns.metadata.name },
});

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

const certManagerBinding = new RoleBinding('pulumi-operator:admin', {
  metadata: { namespace: 'cert-manager', },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
  subjects: [{
    kind: 'ServiceAccount',
    name: sa.metadata.name,
    namespace: sa.metadata.namespace,
  }],
});

const certManager = new CustomResource('cert-manager', {
  apiVersion: 'pulumi.com/v1',
  kind: 'Stack',
  metadata: { namespace: ns.metadata.name },
  spec: {
    serviceAccountName: sa.metadata.name,
    projectRepo,
    repoDir: 'apps/cert-manager',
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
    workspaceTemplate: {
      spec: {
        image: `pulumi/pulumi:${versions.pulumiImage}`,
      },
    },
  },
}, { dependsOn: [sa, crb, certManagerBinding, secret] });
