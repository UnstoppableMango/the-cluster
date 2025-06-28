import { getStack } from '@pulumi/pulumi';
import { AccessToken } from '@pulumi/pulumiservice';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { Directory } from '@pulumi/kubernetes/kustomize/v2';
import { stack, versions } from './config';

const accessToken = new AccessToken(`pulumi-operator-${getStack()}`, {
  description: 'Token for the operator to use to deploy stacks',
});

const secret = new Secret('pulumi-operator', {
  metadata: { namespace: 'pulumi-kubernetes-operator' },
  stringData: {
    accessToken: accessToken.value,
  },
});

const manifests = new Directory('operator', {
  namespace: 'pulumi-operator',
  directory: `https://github.com/pulumi/pulumi-kubernetes-operator/operator/config/default/?ref=v2.0.0-beta.3`,
}, { dependsOn: secret });

export { versions, stack }
