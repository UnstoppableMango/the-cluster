import * as path from 'path';
import { getStack } from '@pulumi/pulumi';
import { AccessToken } from '@pulumi/pulumiservice';
import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Stack } from '@unstoppablemango/thecluster-crds/pulumi/v1';
import { required } from '@unstoppablemango/thecluster';
import { provider, shared } from '@unstoppablemango/thecluster/cluster/from-stack';
import { stack, versions } from './config';
import { ConfigGroup } from '@pulumi/kubernetes/yaml';

const ns = Namespace.get(
  'pulumi-operator',
  shared.namespaces.pulumiOperator,
  { provider },
);

const crds = new ConfigGroup('crds', {
  files: [
    `https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/${versions.pulumiOperator}/deploy/crds/pulumi.com_programs.yaml`,
    `https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/${versions.pulumiOperator}/deploy/crds/pulumi.com_stacks.yaml`,
  ],
}, { provider });

const chart = new Chart('pulumi-operator', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: true,
  values: {
    'pulumi-kubernetes-operator': {
      replicaCount: 2,
      image: {
        registry: 'ghcr.io',
        repository: 'unstoppablemango/pulumi-kubernetes-operator-nodejs',
        tag: versions.customImage,
      },
    },
  },
}, { provider });

const accessToken = new AccessToken(`pulumi-operator-${getStack()}`, {
  description: 'Token for the operator to use to deploy stacks',
});

const secret = new Secret('pulumi-operator', {
  metadata: {
    name: 'pulumi-operator',
    namespace: ns.metadata.name,
  },
  stringData: {
    accessToken: accessToken.value.apply(required),
  },
}, { provider });

// const clusterStack = new Stack(stack.name, {
//   metadata: {
//     name: stack.name,
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     stack: `UnstoppableMango/thecluster-${stack.name}/prod`,
//     accessTokenSecret: secret.metadata.name,
//     projectRepo: 'https://github.com/UnstoppableMango/the-cluster',
//     repoDir: path.join('clusters', stack.name),
//     commit: stack.commit,
//     destroyOnFinalize: false,
//     useLocalStackOnly: true,
//   },
// }, { provider });

export { versions, stack }
