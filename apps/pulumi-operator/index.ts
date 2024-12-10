import { getStack } from '@pulumi/pulumi';
import { AccessToken } from '@pulumi/pulumiservice';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { stack, versions } from './config';
import { Directory } from '@pulumi/kubernetes/kustomize/v2';

const manifests = new Directory('operator', {
  namespace: 'pulumi-operator',
  directory: `https://github.com/pulumi/pulumi-kubernetes-operator/operator/config/default/?ref=v2.0.0-beta.3`,
});

const accessToken = new AccessToken(`pulumi-operator-${getStack()}`, {
  description: 'Token for the operator to use to deploy stacks',
});

const secret = new Secret('pulumi-operator', {
  metadata: { namespace: 'pulumi-kubernetes-operator' },
  stringData: {
    accessToken: accessToken.value,
  },
});

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
