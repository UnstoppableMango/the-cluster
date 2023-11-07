import * as k8s from '@pulumi/kubernetes';
import * as docker from '@pulumi/docker';

const image = new docker.Image('pulumi-kubernetes-operator-nodejs', {
  imageName: 'docker.io/unstoppablemango/pulumi-kubernetes-operator-nodejs',
  build: {
    context: '.',
    platform: 'linux/arm64',
  },
});

const ns = new k8s.core.v1.Namespace('pulumi-kubernetes-operator', {
  metadata: { name: 'pulumi-kubernetes-operator' },
});

const release = new k8s.helm.v3.Release('pulumi-kubernetes-operator', {
  chart: './',
  name: 'pulumi-kubernetes-operator',
  namespace: ns.metadata.name,
  createNamespace: false,
  atomic: true,
  dependencyUpdate: true,
  lint: true,
  skipCrds: true,
  values: {
    image: {
      repository: image.imageName,
      tag: image.repoDigest,
    },
  },
});
