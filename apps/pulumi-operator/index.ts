import * as path from 'path';
import * as pulumi from '@pulumi/pulumi';
import * as ps from '@pulumi/pulumiservice';
import * as k8s from '@pulumi/kubernetes';
import * as crds from '@pulumi/crds/pulumi/v1';

interface Versions {
  customImage: string;
}

interface Stacks {
  rosequartz: {
    commit: string;
  };
}

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');
const stacks = config.requireObject<Stacks>('stacks');

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

const accessToken = new ps.AccessToken('pulumi-operator', {
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

const stack = new crds.Stack('rosequartz', {
  metadata: {
    name: 'rosequartz',
    namespace: ns.metadata.name,
  },
  spec: {
    stack: 'UnstoppableMango/thecluster-rosequartz/prod',
    accessTokenSecret: secret.metadata.name,
    projectRepo: 'https://github.com/UnstoppableMango/the-cluster',
    repoDir: path.join('clusters', 'rosequartz'),
    commit: stacks.rosequartz.commit,
    destroyOnFinalize: false,
    useLocalStackOnly: true,
  },
});
