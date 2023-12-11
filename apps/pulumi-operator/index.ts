import * as path from 'path';
import * as pulumi from '@pulumi/pulumi';
import * as ps from '@pulumi/pulumiservice';
import * as k8s from '@pulumi/kubernetes';
import * as crds from '@unmango/thecluster-crds/pulumi/v1';
import { Stacks, Versions } from './types';

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');
const stack = config.requireObject<Stacks>('stack');

const ns = new k8s.core.v1.Namespace('pulumi-operator', {
  metadata: { name: 'pulumi-operator' },
});

const chart = new k8s.helm.v3.Chart('pulumi-operator', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: true,
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'Deployment') return;
    // We need to manually set the image instead of using values because the
    // chart puts a `v` in front of the tag and that doesn't work for a SHA
    const container = obj.spec.template.spec.containers[0];
    container.image = `ghcr.io/unstoppablemango/pulumi-kubernetes-operator-nodejs:${versions.customImage}`;
  }],
});

const accessToken = new ps.AccessToken(`pulumi-operator-${pulumi.getStack()}`, {
  description: 'Token for the operator to use to deploy stacks',
});

const secret = new k8s.core.v1.Secret('pulumi-operator', {
  metadata: {
    name: 'pulumi-operator',
    namespace: ns.metadata.name,
  },
  stringData: {
    accessToken: accessToken.value.apply(x => x ?? ''),
  },
});

const clusterStack = new crds.Stack(stack.name, {
  metadata: {
    name: stack.name,
    namespace: ns.metadata.name,
  },
  spec: {
    stack: `UnstoppableMango/thecluster-${stack.name}/prod`,
    accessTokenSecret: secret.metadata.name,
    projectRepo: 'https://github.com/UnstoppableMango/the-cluster',
    repoDir: path.join('clusters', stack.name),
    commit: stack.commit,
    destroyOnFinalize: false,
    useLocalStackOnly: true,
  },
});
